'use strict';

// This module captures the functionality of talking to the server side of this
// app

angular.module('PSMmla.server', ['PSMmla.util'])

.factory('serv', ['$http'
                 ,'$log'
                 ,'util'
                 ,'$routeParams'
                 , function($http,$log,util,$routeParams) {

  var date = new Date(); 
  var startTime = date.getTime();

  var surveyID; 
  var promptID; 
  var promptData;

  // ## FUnctions ## 
  
  // Post Log Entry 
  var postLogEntry = function(dat){
    dat["sid"] = surveyID; 
    dat["pid"] = promptID;
    dat["prompt-data"] = promptData;
    var d = new Date();
    dat["client-time"] = d.toJSON(); 

    $http.post("log",{
      "sid": surveyID, 
      "pid": promptID, 
      "data": dat
    }); 
  };

  var postParserLogEntry = function(dat){
    $http.post("logParser",{
      "data": JSON.stringify(dat,undefined,"  ")
    }); 
  };

  // Post start message
  var postStartEntry = function(){
    surveyID = $routeParams["sid"]
    promptData = { 
      "given-phrase": $routeParams["phrase"],
      "AI": $routeParams["AI"],
      "prompt-type": $routeParams["type"],
      "start-time": date.toJSON()
    };
    postLogEntry({ 
      "entry-type":"start"
    });
  };

  // post user selects command element
  var postSelectDropdown = function(cmd,ind){
    postLogEntry({
      "entry-type":"selectDropdown", 
      "command": cmd, 
      "index" : ind
    });
  }

  // post user select option message
  var postSelectOption = function(cmd,ind,option){
    postLogEntry({
      "entry-type":"selectOption", 
      "command": cmd, 
      "index" : ind,
      "option" : option
    });
  }

  // post user undo message 
  var postUndo = function(cmd){
    postLogEntry({
      "entry-type":"undo", 
      "command": cmd 
    });
  }

  // post user redo message
  var postRedo = function(cmd){
    postLogEntry({
      "entry-type":"redo", 
      "command": cmd 
    });
  }

  // post give up appear message
  var postGiveUpAppear = function(){
    postLogEntry({
      "entry-type":"giveUpAppear" 
    });
  };

  // post finish message
  var postFinish = function(str,cmd,gaveUp){
    var d = new Date();
    var timeTaken = d.getTime() - startTime;
    var timesecs = Math.round(timeTaken / 1000);
    var mins = Math.floor(timesecs / 60); 
    var secs = (timesecs % 60);
    if(secs < 10){ secs = "0" + secs; } else { secs = secs.toPrecision(2) }
    if(mins < 10){ mins = "0" + mins; } else { mins = mins.toPrecision(2) }
    var ps = promptID.split('-')
    var nonce = mins + secs + ps[0];
    postLogEntry({
      "entry-type":"finish",
      "time-taken":timeTaken,
      "final-string":str, 
      "command": cmd,
      "gave-up": gaveUp, 
      "nonce": nonce
    });
    return nonce;
  }


  // ### Initialization actions ###

  $http.get('new/pid.json').success(function(data) {
    promptID = data['pid'];
    postStartEntry();
  });  

  return {
    postStartEntry: postStartEntry,
    postSelectDropdown: postSelectDropdown, 
    postSelectOption: postSelectOption, 
    postUndo: postUndo, 
    postRedo: postRedo, 
    postGiveUpAppear: postGiveUpAppear, 
    postFinish: postFinish,
    postParserEntry: postParserLogEntry
  };
}]);


