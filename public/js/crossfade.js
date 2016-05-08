'use strict';

angular.module('crossfade', [])

.directive('crossfade', function () {
	return {
		templateUrl: 'views/crossfade.html',
		link: function(scope, element, attrs) {
			function doFade() {
				var secondary = scope.secondary = scope.primary;
				var primary = scope.primary = scope.primary === scope.a? scope.b : scope.a;
				
				primary.$
					.addClass('fading')
					.detach()
					.insertAfter(secondary.$)
					.fadeIn(700, function() {
						secondary.$.hide();
						primary.$.removeClass('fading');
					})
			}
			
			function setSrc(src) {
				scope.secondary.$.one("load", doFade)
				scope.secondary.src = src;
			}
			
			scope.src = attrs.src;
			scope.a = {
				src: scope.src,
				$: $('.img-a', element)
			};
			scope.b = {
				src: scope.src,
				$: $('.img-b', element)
			};
			
			scope.primary = scope.a;
			scope.secondary = scope.b;
			
			scope.$watch('src', setSrc);
		}
	};
});
