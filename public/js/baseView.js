'use strict';

angular.module('EYBA.BaseView', [
    'ngRoute',
    'dragAndDrop',
])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/baseView.html',
    controller: 'BaseViewCtrl'
  });
}])

.controller('BaseViewCtrl',
  ['$scope'
    ,'$log'
    ,'$routeParams'
    ,function($scope,$log,$routeParams) {

      // Global state that controls what's displayed
      $scope.rightBoxDirective = "none"
      $scope.leftBoxDirective  = "none"
      $scope.fullBoxDirective  = "none"
      $scope.isTwoColMode = true

      
      // State transistion functions 
      $scope.toStartState = function(){ 
        $scope.isTwoColMode = true
        $scope.rightBoxDirective = "col-start"
        $scope.fullBoxDirective  = "none"
        $scope.leftBoxDirective  = "none"
        $log.debug("toStartState");
      }

      $scope.toDragState = function(){ 
        $scope.isTwoColMode = true
        $scope.rightBoxDirective = "col-drag"
        $scope.fullBoxDirective  = "none"
        $scope.leftBoxDirective  = "none"
        $log.debug("toDragState");
      }
      
      $scope.toFullState = function(){ 
        $scope.isTwoColMode = true
        $scope.rightBoxDirective = "col-full"
        $scope.fullBoxDirective  = "none"
        $scope.leftBoxDirective  = "none"
        $log.debug("toFullState");
      }

      $scope.toBreatheState = function(){ 
        $scope.isTwoColMode = true
        $scope.rightBoxDirective = "col-breathe"
        $scope.fullBoxDirective  = "none"
        $scope.leftBoxDirective  = "bin-breathe"
        $log.debug("toBreatheState");
      }

      $scope.toLeakState = function(){ 
        $scope.isTwoColMode = true
        $scope.rightBoxDirective = "col-leak"
        $scope.fullBoxDirective  = "none"
        $scope.leftBoxDirective  = "bin-leaked"
        $log.debug("toLeakState");
      }

      $scope.toHelpState = function(){ 
        $scope.isTwoColMode = true
        $scope.rightBoxDirective = "col-help"
        $scope.fullBoxDirective  = "none"
        $scope.leftBoxDirective  = "none"
        $log.debug("toHelpState");
      }

      $scope.toToolsState = function(){ 
        $scope.isTwoColMode = true
        $scope.rightBoxDirective = "col-tools"
        $scope.fullBoxDirective  = "none"
        $scope.leftBoxDirective  = "none"
        $log.debug("toToolsState");
      }
      
      $scope.toDrawState = function(){ 
        $scope.isTwoColMode = false
        $scope.rightBoxDirective = "none"
        $scope.fullBoxDirective  = "full-draw"
        $scope.leftBoxDirective  = "none"
        $log.debug("toDrawState");
      }

      $scope.toRemoveState = function(){ 
        $scope.isTwoColMode = true
        $scope.rightBoxDirective = "col-remove"
        $scope.fullBoxDirective  = "none"
        $scope.leftBoxDirective  = "none"
        $log.debug("toRemoveState");
      }

      $scope.toEmptyState = function(){ 
        $scope.isTwoColMode = false
        $scope.rightBoxDirective = "none"
        $scope.fullBoxDirective  = "full-empty"
        $scope.leftBoxDirective  = "none"
        $log.debug("toEmptyState");
      }

      $scope.toChecklistState = function(){ 
        $scope.isTwoColMode = false
        $scope.rightBoxDirective = "none"
        $scope.fullBoxDirective  = "full-checklist"
        $scope.leftBoxDirective  = "none"
        $log.debug("toChecklistState");
      }

      // Initalize Application
      $scope.toStartState();
}])

// The directive that manages the right bax of the two column layout 
.directive('fullBox', [function (){
  return {
    restrict: 'E',
    replace: true, 
    template:
      // This swtich statement creates the relevant directive when the 
      // 'rightBoxDirective' variable in the BaseViewScope is changed
        "<div ng-switch='fullBoxDirective' ng-hide='isTwoColMode'>" 
      +   "<full-draw ng-switch-when='full-draw'></full-draw>"
      +   "<full-empty ng-switch-when='full-empty'></full-empty>"
      +   "<full-checklist ng-switch-when='full-checklist'></full-checklist>"
      + "</div>"
  };
}])

// The directive that manages the right bax of the two column layout 
.directive('rightBox', [function (){
  return {
    restrict: 'E',
    replace: true, 
    template:
      // This swtich statement creates the relevant directive when the 
      // 'rightBoxDirective' variable in the BaseViewScope is changed
        "<div ng-switch='rightBoxDirective' ng-hide='!isTwoColMode'>" 
      +   "<col-start ng-switch-when='col-start'></col-start>"
      +   "<col-drag ng-switch-when='col-drag'></col-drag>"
      +   "<col-full ng-switch-when='col-full'></col-full>"
      +   "<col-breathe ng-switch-when='col-breathe'></col-breathe>"
      +   "<col-leak ng-switch-when='col-leak'></col-leak>"
      +   "<col-help ng-switch-when='col-help'></col-help>"
      +   "<col-tools ng-switch-when='col-tools'></col-tools>"
      +   "<col-draw ng-switch-when='col-draw'></col-draw>"
      +   "<col-remove ng-switch-when='col-remove'></col-remove>"
      +   "<col-empty ng-switch-when='col-empty'></col-empty>"
      +   "<col-checklist ng-switch-when='col-checklist'></col-checklist>"
      + "</div>"
  };
}])

// The directive that manages the right bax of the two column layout 
.directive('leftBox', [function (){
  return {
    restrict: 'E',
    replace: true, 
    template:
        "<div ng-hide='!isTwoColMode'>"
      // The balloon will alwys be visible as long as the left box is visible
      +   "<balloon></balloon>"
      // This swtich statement creates the relevant directive when the 
      // 'leftBoxDirective' variable in the BaseViewScope is changed
      +   "<div ng-switch='leftBoxDirective'>" 
      +     "<bin-breathe ng-switch-when='bin-breathe'></bin-breathe>"
      +     "<bin-leaked ng-switch-when='bin-leaked'></bin-leaked>"
      +   "</div>"
      + "</div>"
  };
}])

// The directive for the 2nd column of the start state with just the logo
// and start button. 
.directive('colStart', [function (){
  return {
    restrict: 'E',
    template:
        "<img src='images/Soul-Shoppe-Logo.png' alt='Soul Shoppe Logo'>"
      + "<button ng-click=\"toDragState()\">Start Here</button>"
  };
}])

// The directive for the right column of adding feelings to balloons
.directive('colDrag', [function (){
  return {
    restrict: 'E',
    template:
        "Drag feelings into the balloons"
      + "TODO: add emotions"
      + "<button ng-click=\"toFullState()\">Done Adding Feelings</button>"
  };
}])

// The directive for the right column of a full balloon
.directive('colFull', [function (){
  return {
    restrict: 'E',
    template:
        "Wow that's a full baloon"
      + "<button ng-click=\"toBreatheState()\">It is!</button>"
  };
}])

// The directive for the right column of the "take a breath" state
.directive('colBreathe', [function (){
  return {
    restrict: 'E',
    template:
        "Take a breath"
      + "<button ng-click=\"toLeakState()\">Done Breathing</button>"
  };
}])

// The directive for the right column of the "what have you leaked" state
.directive('colLeak', [function (){
  return {
    restrict: 'E',
    template:
        "How have you leaked emotions?"
      + "<img ng-repeat='image in images' ng-src='images/instructions/{{image}}' drag drag-model='image'></img>" 
      + "<button ng-click=\"toHelpState()\">Finished</button>"
    , 
    controller: ['$scope', function ($scope){ 
      $scope.images = ['excluding.png','gossip_tear.png','pushing.png','disrespectful.png']
    }]
  };
}])

// The directive for the right column of the "what have you leaked" state
.directive('binLeaked', [function (){
  return {
    restrict: 'E',
    template:
        "<div drop drop-callback='onDropLeak'>"
      +   " Drag target"
      +   "<img ng-repeat='image in images' ng-src='images/instructions/{{image}}'></img>" 
      + "</div>"
    , 
    controller: ['$scope','$log', function ($scope,$log){ 
      $scope.images = []
      $scope.onDropLeak = function(leaked) { 
        $scope.images += [leaked.clone]
        $log.debug("dropped " + leaked)
      }
    }]

  };
}])
// The directive for the right column of the "what have you leaked" state
.directive('colHelp', [function (){
  return {
    restrict: 'E',
    template:
        "There's still feelings in your balloon. Let's help you empty it."
      + "<button ng-click=\"toToolsState()\">Finished</button>"
  };
}])

// The directive for the right column of the "what have you leaked" state
.directive('colTools', [function (){
  return {
    restrict: 'E',
    template:
        "Ways to deal"
      + "<button ng-click=\"toDrawState()\">Draw</button>"
  };
}])

// The directive for the draw stuff page
.directive('fullDraw', [function (){
  return {
    restrict: 'E',
    template:
        "Draw a thing"
      + "<button ng-click=\"toRemoveState()\">Done</button>"
  };
}])

// The directive for the right column of the "what have you leaked" state
.directive('colRemove', [function (){
  return {
    restrict: 'E',
    template:
        "remove the emotions you got released with your activity"
      + "<button ng-click=\"toEmptyState()\">Done</button>"
  };
}])

// The directive for the right column of the "what have you leaked" state
.directive('fullEmpty', [function (){
  return {
    restrict: 'E',
    template:
        "Congrats, you're empty?"
      + "<button ng-click=\"toChecklistState()\">Done</button>"
  };
}])

// The directive for the right column of the "what have you leaked" state
.directive('fullChecklist', [function (){
  return {
    restrict: 'E',
    template:
        "Checklist"
      + "<button ng-click=\"toStartState()\">Done</button>"
  };
}])

// The directive for the right column of the "what have you leaked" state
.directive('binBreathe', [function (){
  return {
    restrict: 'E',
    template:
        "breath images"
  };
}])


// The directive for the balloon itself
.directive('balloon', [function (){
  return {
    restrict: 'E',
    template:
        "<img src='images/balloons/balloons.png' width='100' height='100'></img>"
  };
}])

;
