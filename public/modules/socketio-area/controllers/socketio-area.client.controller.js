'use strict';

angular.module('socketio-area').controller('SocketioAreaController', ['$scope',
	function($scope) {
        /* boilerplate for socketio & twitter */
        var _socket = null;
        hookupTwitterIO();
        
        /* declarations */
		var firstName = '',
            lastName = '';
        $scope.lastTenTweets = [];  
        
        /* SUPPORT FUNCTIONS */
        function emitMsj(signal, o) {
            if(_socket) {
                _socket.emit(signal, o);
            }
            else {
                alert("SocketIO borked.");
            }
        }
      
        function hookupTwitterIO() {
            var server = process.env.NODE_ENV === 'production' 
                ? 'http://asuttmiller-pf-2.herokuapp.com/'
                : 'http://localhost:3000/';
            _socket = io.connect(server);
        
            // This will listen when the server emits the "connected" signal
            // informing to the client that the connection has been stablished
            _socket.on("connected", function(r) {
                // Here the client tells the server to "start stream"
                emitMsj("start stream");
            });

            // This will listen to the "new tweet" signal everytime
            // there's a new tweet incoming into the stream
            _socket.on("new tweet", function(tweet) {
                // asynchronous changes can not be monitored by angular
                // so we have to tell it to re-digest the changes
                $scope.$apply(function() {
                  $scope.lastTenTweets.unshift(tweet);
                  if ($scope.lastTenTweets.length > 10) {
                      $scope.lastTenTweets.pop();
                  }
                });
            });
        }
	}                                                           
]);