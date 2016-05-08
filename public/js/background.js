'use strict';

angular.module('background', ['crossfade'])

.directive('background', function () {
	return {
		templateUrl: 'views/background.html',
		transclude: true,
		link: function(scope) {
			scope.src = "images/backgrounds/default.png";
		}
	};
});
