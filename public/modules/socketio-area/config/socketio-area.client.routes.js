'use strict';

//Setting up route
angular.module('socketio-area').config(['$stateProvider',
	function($stateProvider) {
		// Socketio area state routing
		$stateProvider.
		state('socketio-area', {
			url: '/socketio',
			templateUrl: 'modules/socketio-area/views/socketio-area.client.view.html'
		});
	}
]);