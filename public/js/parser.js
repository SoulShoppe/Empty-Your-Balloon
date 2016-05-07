
'use strict';

angular.module('PSMmla.parserView', [
    'ngRoute','PSMmla.util','PSMmla.server'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/parser', {
    templateUrl: 'views/parser.html',
    controller: 'ParserViewCtrl'
  });
}])

.controller('ParserViewCtrl',
    ['$scope'
    ,'$log'
    ,'serv'
    ,function($scope,$log,serv) {
  
    var log = function(s){ 
      serv.postParserEntry(s); 
      $log.log(s); 
    };

    $scope.message = ""; 
    $scope.messageLevel = 'hidden';

    // Raw Input String 
    $scope.rawText = "";
    $scope.rawSyntax = false; 
    $scope.rawErrors = ""; 
  
    // Easy Grammar Syntax
    $scope.grammarText = ""
    $scope.grammarSyntax = false; 
    $scope.grammarErrors = ""; 
    $scope.grammarStructure = new Map(); 

    // RAW JSON Output
    $scope.PSMJson = {};
    $scope.PSMJsonText = "";
    $scope.PSMJsonErrors = ""; 

    $scope.parseRaw = function(raw){ 
      var splitString = raw.split("\n");
      var obj = new Map(); 
      var errors = ""; 
      var lineRE = /(\<[^\<\>]+\>)\s*:([^\n\R]+)/;
      
      _.each(splitString, function(line){
        if(line == ""){ 
        } else if( line.startsWith("#")) {
        } else if(lineRE.test(line)){ 
          var match = lineRE.exec(line);
          var LHS = match[1]; 
          var RHSs = match[2].split("|");
          var RHSs = _.map(RHSs, function(s){ return s.trim() ;}); 
          RHSs = _.filter(RHSs, function(s){ return s !== "";});
          if($scope.grammarStructure[LHS]){
            $scope.grammarStructure[LHS] = _.union( $scope.grammarStructure[LHS], RHSs);
          } else {
            $scope.grammarStructure[LHS] = _.uniq(RHSs);
          }
        } else {
          errors = errors + 
                   "Error on line containing:\n\n      " + angular.toJson(line) + "\n\n";
        }
      }); 

      if(errors !== ""){ 
        $scope.rawErrors = errors; 
        $scope.rawSyntax = false; 
      } else {
        $scope.rawErrors = ""; 
        $scope.rawSyntax = true; 
      }

      $scope.refreshGrammar();
      $scope.genJSON();
    };
   
    
    $scope.refreshGrammar = function(){ 
      var stringOut = "";
      var keys = _.keys($scope.grammarStructure).sort();
      _.each(keys, function(LHS){
        var RHSs = $scope.grammarStructure[LHS].sort();
        var termString = ""; 
        var LHSindent = " ".repeat(LHS.length); 
        var index = 0; 
        _.each(RHSs, function(RHS){
          if(index == 0){ 
            termString = termString + LHS + " = " + RHS + "\n"; 
          } else { 
            termString = termString + LHSindent + " | " + RHS + "\n";
          }
          index++; 
        });
        stringOut = stringOut + termString + "\n\n"; 
      });
      log("Previous Grammar Text:\n" + $scope.grammarText + "\n\n"); 
      $scope.grammarText = stringOut;
    }

    $scope.parseGrammar = function(grammar){
      log("Previous Grammar Structure:\n" + JSON.stringify($scope.grammarStructure,undefined,"  ") + "\n\n");
      var gramStruct = new Map(); 
      var lines = grammar.split("\n"); 
      var errors = ""; 
      var LHS = ""; 

      _.each(lines, function(line){ 
        line = line.trim(); 
        if(line === ""){ 
        } else if (line.includes("=")) {

          var sections = line.split("="); 
          LHS = sections[0].trim(); 
          var RHS = sections[1].trim();

          if(RHS !== ""){
            if($scope.grammarStructure[LHS]){
              gramStruct[LHS] = _.union(gramStruct[LHS], [RHS]);
            } else {
              gramStruct[LHS] = [RHS];
            }
          }
        } else if (line.includes("|")) {
          if(LHS == ""){
            errors = errors + 
                     "No LHS specified before line:\n      " + line + "\n\n";
          }

          var sections = line.split("|"); 
          var RHS = sections[1].trim(); 

          if(RHS !== ""){
            if(gramStruct[LHS]){
              gramStruct[LHS] = _.union(gramStruct[LHS], [RHS]);
            } else {
              gramStruct[LHS] = [RHS];
            }
          }

        } else { 
          errors = errors + 
                   "Error on line containing: \n\n      " + line + "\n\n";
        }

      }); 

      if(errors !== ""){ 
        $scope.grammarErrors = errors; 
        $scope.grammarSyntax = false; 
      } else {
        $scope.grammarErrors = ""; 
        $scope.grammarSyntax = true; 
      }

      $scope.grammarStructure = gramStruct;
      $scope.genJSON(); 
    }; 

    $scope.genJSON = function(){ 
      
      log("Previous Generated JSON:\n" + JSON.stringify($scope.PSMJson,undefined,"  ") + "\n\n");
      var gj = new Map(); 
      var counter = 0; 
      _.each($scope.grammarStructure, function(RHSs,LHS){ 
        var nLHS = LHS.trim().replace("<","").replace(">","");
        var key = nLHS + counter; 
        // TODO : whoops, I mixed them up :V 
        var value = {"RHS": nLHS, "LHS": RHSs};
        gj[key] = value; 
        counter++; 
      })

      $scope.PSMJson = gj;
      $scope.PSMJsonText = JSON.stringify($scope.PSMJson,undefined,"    ");
      $scope.validateJSON();
    };

  $scope.validateJSON = function(){ 
    
    var LHSs = [];
    var terms = [];
    var errors = ""; 

    _.each($scope.PSMJson, function(v){ 
      // TODO : fix it here too :V 
      var LHS = v['RHS'];
      var RHSs = v['LHS'];
      LHSs.push(LHS); 


      _.each(RHSs, function(RHS){ 

        // Check for dangling terms
        var dangleRE = /(\<[^\>]*$|^[^\<]*\>)/;
        if(dangleRE.exec(RHS)){ 
          errors = errors + "Malformed RHS with dangling '>' or '<' within rule '<"+ LHS + "> = " + RHS + "'\n\n"; 
        }


        var termRegExp = /\<([^\<\>]*)\>/g;
        var term = null; 
        while((term = termRegExp.exec(RHS)) !== null){
          terms.push({
            term: term[1], 
            RHS: RHS, 
            LHS: LHS
          });
        };

        

      }); 
    });


    _.each(terms, function(term){ 
      var ts = term.term; 

      if(ts.startsWith("range(")){
      } else if (ts.startsWith("textbox(")){
      } else if (ts.startsWith("time(")){
      } else if (! _.contains(LHSs,ts)){ 
        errors = errors + "Term '" + ts + "' not found within grammar." +
                " Used within rule '<"+ term.LHS + "> = " + term.RHS + "'\n\n"; 
      }
    });

    $scope.PSMJsonErrors = errors; 

  };


  $scope.parseJSON = function(json){ 
    var syntax = angular.fromJson(json); 
    var obj = new Map(); 
  
    _.each(syntax, function(v){
      
      var LHS = "<" + v['RHS'] + ">"; 
      var RHSs = v['LHS'];
      RHSs = _.filter(RHSs, function(s){ return s !== "";});
      if(obj[LHS]){
        obj[LHS] = _.union( obj[LHS], RHSs);
      } else {
        obj[LHS] = _.uniq(RHSs);
      }
    }); 

    $scope.grammarStructure = obj; 

    $scope.refreshGrammar();
    $scope.genJSON();
  }; 

}])

;
