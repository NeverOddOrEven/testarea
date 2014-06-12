angular.module('socketio-area')
  .directive('tweet', ['$window', 
      function($window) {
          function link(scope, element, attrs) {
              
          }
          return {
              restrict: 'EA',
              scope: {
                  tweetData : '='
              },
              link: link,
              templateUrl: 'modules/socketio-area/views/directive-templates/tweet.directive.html'
          };
      }
  ]);