'use strict';

// This is a set of directives that capture the DOM state of commands that are
// either partially complete and waiting for completion or are completely 
// resolved. 

angular.module('PSMmla.command', ['PSMmla.util','PSMmla.grammar','RecursionHelper'])

.directive('cmd', ['util','GrammarServ', function (util,grammar){
  return {
    restrict: 'E',
    replace: true, 
    scope: {
       rule: '=', // The command object to be displayed
       activeInd: '=',
       clickLeaf: '&',
       indexStr: '@index', // the index of this element within the dom tree.
    },
    template: 
      '  <span class="cmd {{activeClass()}}">' +                
         ' <cmd-cmpt ng-repeat="rc in rule.inst track by $index" ' +
                   ' cmpt="rc"' +
                   ' active-ind="activeInd"' +
                   ' index="{{index.concat([$index])}}"' +
                   ' click-leaf="clickLeaf({ind: ind})">' +
         ' </cmd-cmpt>' +
      '  </span>'
    ,
    controller: ['$scope', function ($scope){

      $scope.index = angular.fromJson($scope.indexStr);

      $scope.activeClass = function(){ 
        if(!$scope.activeInd  || (!util.arraysEqual($scope.index,$scope.activeInd))){
          return "";
        } else {
          return "active";
        }
      };
    }],
  };
}])

.directive('cmdCmpt' , ['util', function(util){
  return {
    restrict: 'E',
    replace: true, 
    scope: {
      cmpt: '=',
      activeInd: '=',
      parentdd: '=',
      clickLeaf: '&',
      indexStr: '@index' 
    },
    templateUrl: 'views/cmdCmpt.html', 
    controller: ['$scope', function ($scope) {
      $scope.index = angular.fromJson($scope.indexStr);
      $scope.activeClass = function(){ 
        if(!$scope.activeInd   || (!util.arraysEqual($scope.index,$scope.activeInd))){
          return "";
        } else {
          return "active";
        }
      };
    }],
  }
}])

.directive('cmdLit' , ['util', function(util){
  return {
    restrict: 'E',
    replace: true, 
    scope: {
      cmpt: '=',
      activeInd: '=',
      clickLeaf: '&',
      indexStr: '@index' 
    },
    template: '<span class="lit {{activeClass()}}" > {{cmpt.literal}}</span>', 
    controller: ['$scope', function ($scope) {
      // Literals refer to their parents since they themselves don't really 
      // do anything. 
      $scope.index = angular.fromJson($scope.indexStr);
      $scope.index = _.first($scope.index,$scope.index.length - 1);
      $scope.activeClass = function(){ 
        if(!$scope.activeInd 
            || (!util.arraysEqual($scope.index,$scope.activeInd))){
          return "";
        } else {
          return "active";
        }
      };
    }],
  }
}])

.directive('cmdHol' , ['util', function(util){
  return {
    restrict: 'E',
    replace: true, 
    scope: {
      cmpt: '=',
      activeInd: '=',
      clickLeaf: '&',
      indexStr: '@index' 
    },
    template: 
       ' <span class="hol {{activeClass()}} dropdown" ' +
             ' ng-click="clickLeaf({ind: index})"> ' +
          '{{types | holeFormat}}' +
       ' </span>'
    , 
    controller:['$scope', function ($scope) {
      $scope.index = angular.fromJson($scope.indexStr);
      $scope.types = _.values($scope.cmpt.type); 
      $scope.activeClass = function(){ 
        if(!$scope.activeInd 
            || (!util.arraysEqual($scope.index,$scope.activeInd))){
          return "";
        } else {
          return "active";
        }
      };
    }],
  }
}])

.directive('cmdInst' , ['util','RecursionHelper', function(util,RecursionHelper){
  return {
    restrict: 'E',
    replace: true, 
    scope: {
      cmpt: '=',
      activeInd: '=',
      parentdd: '=',
      clickLeaf: '&',
      indexStr: '@index' 
    },
    template: 
       ' <span class="inst {{activeClass()}}" > ' +
         ' <cmd rule="cmpt.inst" ' +
              ' active-ind="activeInd" ' +
              ' parentdd="parentdd" ' +
              ' click-leaf="clickLeaf({ind: ind})" ' +
              ' index="{{indexStr}}"> '+ 
         ' </cmd> ' +
       ' </span>'
    , 
    compile: function (element){            
        return RecursionHelper.compile(element, 
            function($scope, iElement, iAttrs, controller, transcludeFn){
                $scope.index = angular.fromJson($scope.indexStr);
                $scope.activeClass = function(){ 
                  if(!$scope.activeInd 
                      || (!util.arraysEqual($scope.index,$scope.activeInd))){
                    return "";
                  } else {
                    return "active";
                  }
                };
      });
    }
  }
}])

.directive('cmdRng' , ['util', function(util){
  return {
    restrict: 'E',
    replace: true, 
    scope: {
      cmpt: '=',
      activeInd: '=',
      clickLeaf: '&',
      indexStr: '@index' 
    },
    template:
       ' <span class="rng {{(cmpt.isSet && cmpt.val)?\'set\':\'unset\'}}"> ' +
         ' <input type="number" ' +
                ' class="input {{(cmpt.isSet && cmpt.val)?\'set\':\'unset\'}}" ' +
                ' ng-focus="updateView()" ' +
                ' ng-model="cmpt.val" ' +
                ' min="cmpt.min" ' +
                ' max="cmpt.max"> ' +
         ' </input> ' +
       ' </span> '
    , 
    controller: ['$scope', function ($scope) {
      $scope.index = angular.fromJson($scope.indexStr);

      $scope.updateView = function(){ 
        if(!$scope.cmpt.isSet) $scope.cmpt.val = ""; 
        $scope.cmpt.isSet = true; 
      }

      $scope.activeClass = function(){ 
        if(!$scope.activeInd 
            || (!util.arraysEqual($scope.index,$scope.activeInd))){
          return "";
        } else {
          return "active";
        }
      };
    }],
  }
}])

.directive('cmdTxtbx' , ['util', function(util){
  return {
    restrict: 'E',
    replace: true, 
    scope: {
      cmpt: '=',
      activeInd: '=',
      clickLeaf: '&',
      indexStr: '@index' 
    },
    template: 
      '  <span class="txtbx {{(cmpt.isSet && cmpt.val)?\'set\':\'unset\'}}"> '+
         ' <input type="text" '+
                ' class="input {{(cmpt.isSet && cmpt.val)?\'set\':\'unset\'}}"'+
                ' ng-focus="updateView()"'+
                ' ng-model="cmpt.val">'+
         ' </input>'+
      '  </span>'
    , 
    controller: ['$scope', function ($scope) {
      $scope.index = angular.fromJson($scope.indexStr);

      $scope.updateView = function(){ 
        if(!$scope.cmpt.isSet) $scope.cmpt.val = ""; 
        $scope.cmpt.isSet = true; 
      };
    }]
  }
}])

.directive('cmdTime' , ['util', function(util){
  return {
    restrict: 'E',
    replace: true, 
    scope: {
      cmpt: '=',
      activeInd: '=',
      clickLeaf: '&',
      indexStr: '@index' 
    },
    template: 
      '  <span class="time {{(cmpt.isSet && cmpt.val)?\'set\':\'unset\'}}"> '+
         ' <input type="time" '+
                ' class="input {{(cmpt.isSet && cmpt.val)?\'set\':\'unset\'}}"'+
                ' ng-focus="updateView()"'+
                ' ng-model="cmpt.val">'+
         ' </input>'+
      '  </span>'
    , 
    controller: ['$scope', function ($scope) {
      $scope.index = angular.fromJson($scope.indexStr);

      $scope.updateView = function(){ 
        $scope.cmpt.isSet = true; 
      };
    }]
  }
}])

.filter('holeFormat', ['util','$log', function(util,$log) {
  return function(input) {
    
    if(input.length > 1){
              $log.error("Printing holes\n\n" + JSON.stringify(input,undefined,"  ") + "\n\n");
    }
    var withPipe = util.interleave(_.uniq(input)," | "); 


    if(input.length > 1){
              $log.error("Print\n\n" + JSON.stringify(withPipe,undefined,"  ") + "\n\n");
    }
    var o = ""; 
    _.each(withPipe, function(e){
      if(e.includes('%')){ 
        e = e.split('%')[0]; 
      }
      o = "" + o + e; 
    });
    return "<" + o + ">";
  };
}])


; 

