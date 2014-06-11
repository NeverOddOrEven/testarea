'use strict';

//Setting up route
angular.module('css3dparallax').config(['$stateProvider',
	function($stateProvider) {
		// Css3dparallax state routing
		$stateProvider.
		state('css3dparallax', {
			url: '/css3dparallax',
			templateUrl: 'modules/css3dparallax/views/css3dparallax.client.view.html'
		});
	}
]);