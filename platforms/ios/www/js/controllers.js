angular.module('mobyfyApp.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('GroupCtrl', function($scope, Groups) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.groups = Groups.all();
  $scope.remove = function(Group) {
    Groups.remove(Group);
  };
})

.controller('GroupDetailCtrl', function($scope, $stateParams, Groups) {
    console.log($stateParams);

  $scope.group = Groups.get($stateParams.groupId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
