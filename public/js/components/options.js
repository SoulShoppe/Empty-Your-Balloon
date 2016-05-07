'use strict';

// This is a set of directives that capture the DOM state of The set of 
// currently available options to the user.


angular.module('PSMmla.options', ['PSMmla.util'
                                 ,'PSMmla.grammar'
                                 ,'PSMmla.command'
                                 ,'RecursionHelper'])

.directive('options', ['util', function (util){
  return {
    restrict: 'E',
    replace: true, 
    scope: {
      options: '=',
      onSelect: '&', 
    },
    template:  
       '<div class="options"> ' + 
        ' <option ng-repeat="opt in options" ' +
                ' option="opt" ' +
                ' on-select="onSelect({option: option})" ' +
        ' ></option> ' +
       '</div> '
  }; 
}])

.directive('option', ['util','GrammarServ','$log', function (util,grammar,$log){
  return {
    restrict: 'E',
    replace: true, 
    scope: {
      option: '=',
      onSelect: '&', 
    },
    template: 
       ' <div class="option" ng-click="onSelect({option: option})"> ' +
           ' <opt-cmpt ng-repeat="rc in option.inst track by $index" ' +
                     ' cmpt="rc"> ' +
           ' </opt-cmpt> ' +
           ' {{text}} ' +
       ' </div> '
    , 
    controller: ['$scope',function ($scope) {
      if(grammar.isEmpty($scope.option)){
        $log.error("found empty option \n\n" + JSON.stringify($scope.option,undefined,"  ") + "\n\n");
        $scope.text = "<Leave option empty>";
      } else {
        $scope.text = "";
      } 
    }]
  }; 
}])

.directive('optCmpt' , ['util', function(util){
  return {
    restrict: 'E',
    replace: true, 
    scope: {
      cmpt: '=',
    },
    template: 
       ' <span class="rule-components">'+
         ' <opt-lit ng-if="cmpt.cmpType == \'lit\'" lit="cmpt.literal"></opt-lit> ' +
         ' <opt-hol ng-if="cmpt.cmpType == \'hol\'" type="cmpt.type"></opt-hol> '+
         ' <opt-inst ng-if="cmpt.cmpType == \'inst\'" cmpt="cmpt" ></opt-inst> '+
         ' <opt-rng ng-if="cmpt.cmpType == \'rng\'" cmpt="cmpt" ></opt-rng>'+
         ' <opt-txtbx ng-if="cmpt.cmpType == \'txtbx\'" cmpt="cmpt"></opt-txtbx>'+
         ' <opt-time ng-if="cmpt.cmpType == \'time\'" cmpt="cmpt"></opt-txtbx>'+
       ' </span>'
  }
}])

.directive('optLit' , ['util', function(util){
  return {
    restrict: 'E',
    replace: true, 
    scope: {
      lit: '=',
    },
    template: '<span class="lit"> {{lit}} </span>' 
  }
}])

.directive('optHol' , ['util', function(util){
  return {
    restrict: 'E',
    replace: true, 
    scope: {
      type: '=',
    },
    template: '<span class="hol"> {{types | holeFormat}} </span>', 
    controller: ['$scope', function ($scope) {
      $scope.types = _.values($scope.type); 
    }]
  }
}])

.directive('optInst' , ['util','RecursionHelper', function(util,RecursionHelper){
  return {
    restrict: 'E',
    replace: true, 
    scope: {
      cmpt: '=',
    },
    template: 
       ' <span class="inst"> ' +
         ' <opt-cmpt ng-repeat="rc in cmpt.inst.inst track by $index" ' +
                   ' cmpt="rc"> ' +
         ' </opt-cmpt> ' +
       ' </span> '
    , 
    compile: function (element){            
      return RecursionHelper.compile(element, 
        function($scope, iElement, iAttrs, controller, transcludeFn){});
    }
  }
}])

.directive('optRng' , ['util', function(util){
  return {
    restrict: 'E',
    replace: true, 
    scope: {
      cmpt: '=',
    },
    template: '<span class="rng" >{{str}}</span> ', 
    controller: ['$scope', function ($scope) {
      $scope.str = "<Number between " + $scope.cmpt.min + " and " + 
                   $scope.cmpt.max + ">"; 
    }]
  }
}])

.directive('optTxtbx' , ['util', function(util){
  return {
    restrict: 'E',
    replace: true, 
    scope: {
      cmpt: '=',
    },
    template: '<span class="txtbx">{{str}}</span>' , 
    controller: ['$scope', function ($scope) {
      $scope.str = "<"+ $scope.cmpt.desc +">"; 
    }]
  }
}])

.directive('optTime' , ['util', function(util){
  return {
    restrict: 'E',
    replace: true, 
    scope: {
      cmpt: '=',
    },
    template: '<span class="time">{{str}}</span>' , 
    controller: ['$scope', function ($scope) {
      $scope.str = "<Time of Day>"; 
    }]
  }
}])


;
