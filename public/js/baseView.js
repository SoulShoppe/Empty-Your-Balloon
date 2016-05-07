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

}]);
