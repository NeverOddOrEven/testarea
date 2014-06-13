angular.module('socketio-area')
  .directive('tweet', ['$window', 
      function($window) {
          function link(scope, element, attrs) {
              scope.profileUser = scope.tweetData.user.name;
              scope.profileImage = scope.tweetData.user.profile_image_url;
              scope.tweetText = scope.tweetData.text;
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