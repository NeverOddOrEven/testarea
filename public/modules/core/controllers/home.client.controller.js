'use strict';


angular.module('core')
.factory('mySocket', function(socketFactory) {
	return socketFactory();
})
.controller('HomeController', ['$scope', 'Authentication', 'mySocket',
	function($scope, Authentication, mySocket) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		mySocket.emit('message', { my: 'hello world!' });
		mySocket.on('serversayshi', function(data) {
			console.info(data);
			console.log('thats all folks');
		});
	}
]);
