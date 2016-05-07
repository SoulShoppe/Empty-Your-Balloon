'use strict';

angular.module('EYBA.BaseView', [
    'ngRoute',
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
      $scope.rightBoxDirective = "col-start"
      $scope.leftBoxDirective  = "col-start"
      $scope.fullBoxDirective  = "col-start"
      $scope.isTwoColMode = true

      // Utility functions
      $scope.changeRightBoxDirective = function(s){$scope.rightBoxDirective = s}
      
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

      // Initalize Application
      $scope.toStartState();
}])

// The directive that manages the right bax of the two column layout 
.directive('rightBox', [function (){
  return {
    restrict: 'E',
    replace: true, 
    template:
      // This swtich statement creates the relevant directive when the 
      // 'rightBoxDirective' variable in the BaseViewScope is changed
        "<div ng-switch='rightBoxDirective'>" 
      +   "<col-start ng-switch-when='col-start'></col-start>"
      +   "<col-drag ng-switch-when='col-drag'></col-drag>"
      + "</div>"
  };
}])

// The directive that manages the right bax of the two column layout 
.directive('leftBox', [function (){
  return {
    restrict: 'E',
    replace: true, 
    template:
      // The balloon will alwys be visible as long as the left box is visible
      + "<balloon ng-switch-when='balloon'></balloon>"
      // This swtich statement creates the relevant directive when the 
      // 'leftBoxDirective' variable in the BaseViewScope is changed
      + "<div ng-switch='leftBoxDirective'>" 
      +   "<col-breathe ng-switch-when='col-breathe'></col-breathe>"
      +   "<col-leaked ng-switch-when='col-leaked'></col-leaked>"
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
      + "<button ng-click=\"toFullState()\">Done Adding Feelings</button>"
  };
}])
;
