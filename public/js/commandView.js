'use strict';

angular.module('PSMmla.commandView', [
    'ngRoute',
    'PSMmla.grammar',
    'PSMmla.command',
    'PSMmla.server',
    'PSMmla.options',
    'PSMmla.util'
])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/commandView.html',
    controller: 'CommandViewCtrl'
  });
}])

.controller('CommandViewCtrl',
    ['$scope'
    ,'$log'
    ,'GrammarServ'
    ,'serv'
    ,'$routeParams'
    ,function($scope,$log,grammar,srv,$routeParams) {

  // Binds for convinience / debug -- TODO : Remove
  $scope.rp = $routeParams;
  $scope.grammar = grammar;

  // save a clone -- TODO : Remove if unneccesary 
  var rp = _.clone($routeParams); 

  // Get the parameters
  if($routeParams["type"] === 'given'){
    $scope.promptMessage = "Before we continue, we want you to get familiar " +
      "with our drop-down AI interface. This is a phrase that you might say " +
      "to " + $routeParams["AI"] + ":";
  } else { 
    $scope.promptMessage = "This is what you said to " + $routeParams["AI"] +
      ":";
  }

  $scope.promptPhrase = $routeParams["phrase"]; 

  // Initialize the initial partial command with partial type of 'application' 
  $scope.command = grammar.getRootHole(); 

  // Initialize the message 
  $scope.message = "";
  $scope.messageLevel = 'hidden';  
  // can also be 'warning','urgent','normal','hidden' or 'hint'

  // Initialize the Undo/Redo stack
  var undoRedoStack = [$scope.command];
  var stackLoc = 0;

  // status variable for whether the command is complete.
  var submitted = false; 
  $scope.nonce = false; 
  $scope.commandComplete = function(){ 
    return !(submitted) 
           && grammar.isComplete($scope.command) 
           && grammar.isFull($scope.command); 

  }; 

  // Setup Initial Button State 
  $scope.giveUpVisible = false;

  // initialize the option state;
  $scope.options = []; 
  $scope.optionsVisible = false; 
  $scope.optionsIndex = undefined; 

  // Initialize undo/redo state; 
  $scope.undoActive = false; 
  $scope.redoActive = false;

  
    $scope.undoActive = true;
    $scope.redoActive = false; 
  // TODO : Setup GiveUp Times

  // ### Callback Functions ###
  
  // Function that is given an index into the data structure and sets up the 
  // current state correctly. 
  $scope.makeOptions = function(index){ 

    $scope.optionsIndex = index;

    var ncmd = _.clone($scope.command); 
    var currentRuleComp = grammar.getReplacementCompFromCmd(ncmd,index);
    var nopts = grammar.getOptsForComp(currentRuleComp); 

    $log.debug(angular.toJson(_.map(nopts,grammar.printCmd)));

    var optOut =  _.sortBy(nopts, function(opt){
      var v =  grammar.printCmd(opt);   
      return v;
    }); 
    
    $scope.options = optOut; 
    $scope.optionsVisible = true;

    srv.postSelectDropdown(ncmd,index); 
  };

  $scope.applyOption = function(option){ 
    
    var ncmd = _.clone($scope.command); 
    $scope.command = grammar.insertCommand(ncmd,$scope.optionsIndex,
                                          _.clone(option));
    
    srv.postSelectOption($scope.command
                         ,$scope.optionsIndex
                         ,option); 

    undoRedoStack = _.first(undoRedoStack,stackLoc + 1); 
    undoRedoStack.push(_.clone($scope.command));
    stackLoc++; 

    $scope.undoActive = true;
    $scope.redoActive = false; 


    $scope.optionsVisible = false; 
    $scope.optionsIndex = undefined;
    $scope.options = [];

  };  

  $scope.undoApp = function(){
    if($scope.undoActive){
      
      stackLoc--;
      $scope.command = _.clone(undoRedoStack[stackLoc]); 

      // Set undo/redo allowable 
      $scope.undoActive = (stackLoc > 0); 
      $scope.redoActive = (stackLoc + 1 < undoRedoStack.length);

     // $log.debug("Stacksize = " + undoRedoStack.length);
     // $log.debug("StackLoc = " + stackLoc);

     // $log.debug("stack = \n\n" + JSON.stringify(
     //       _.map(undoRedoStack, grammar.printCmd),undefined, "   "));
      // Reset visible options
      $scope.options = []; 
      $scope.optionsVisible = false; 
      $scope.optionsIndex = undefined; 
    
      srv.postUndo($scope.command); 
    }
  };

  $scope.redoApp = function(){ 
    if($scope.redoActive){

      stackLoc++;
      $scope.command = _.clone(undoRedoStack[stackLoc]); 

      // Set undo/redo allowable 
      $scope.undoActive = (stackLoc > 0); 
      $scope.redoActive = (stackLoc + 1 < undoRedoStack.length);

      // Reset visible options
      $scope.options = []; 
      $scope.optionsVisible = false; 
      $scope.optionsIndex = undefined; 
    
      srv.postRedo($scope.command); 
    }
  };

  $scope.submit = function(){
    if($scope.commandComplete()){ 
      
      $scope.message = "";
      $scope.messageLevel = 'hidden';
      $scope.submitted = true;
      $scope.nonce = srv.postFinish(grammar.printCmd($scope.command)
                                    ,$scope.command
                                    ,false); 
    } else { 
      $scope.message = "Please completely fill out a phrase before trying to continue.";
      $scope.messageLevel = 'warning';
    }
  };

}]);
