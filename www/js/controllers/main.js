/**
 * Created by aethiss on 03/08/15.
 */

angular.module('mobyfyApp.mainControllers', ['ngCordova', 'uiGmapgoogle-maps', 'ionic.utils'])

  .controller('MainCtrl', function($scope, $rootScope, $state, $localstorage, $timeout,
                                   $ionicLoading, $ionicModal, $ionicPopup,
                                   LoginFactory, GroupsFactory) {

    $rootScope.user = false; // Default on start ....
    $rootScope.loading = false;

    $scope.$on('$ionicView.enter', function() {
      console.log('Main Controller (dashboard enter)');
    });

    // Need Auth ?
    if (!$rootScope.user) {
      $ionicLoading.show({
        template: 'Connect to Authorization Server...'
      });
      if ($localstorage.existObject('user') && $localstorage.isValidJson('user')) {
        console.log('habemus user');

        // force login
        $timeout( function() {
          $ionicLoading.hide();
          $scope.login();
        }, 500);
      } else {

        // Wait time until is loaded Modal
        $timeout( function() {
          $ionicLoading.hide();
          $scope.openModal();
        }, 500);

        console.log('user not logged');
      }
    }


    /* **********************************  */
    /* ************  LOGIN  *************  */
    /* **********************************  */

    // ONLY FOR LOCAL TEST
    $scope.facebookuser = {
      email: 'aethiss@gmail.com'
    };

    //  initialize login modal
    $ionicModal.fromTemplateUrl('templates/modals/login.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $scope.modal.show();
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    $scope.login = function() {

      $ionicLoading.show({
        template: 'Connect to Authorization Server...'
      });

      LoginFactory.getLogin($scope.facebookuser, 'auto').then(function(result) {
        $ionicLoading.hide();

        if (result.error) {
          $ionicPopup.alert({
            title: 'Error',
            template: result.error
          }).then(function () {
            console.log(result);
          });

        } else {

          console.log(result);

          // Save user
          $rootScope.user = result.params[0];
          $localstorage.setObject('user', result.params[0]);
          if (result.groups.length) {
            $localstorage.setObject('groups', result.groups);
            GroupsFactory.setGroups(result.groups);
          }

          $scope.closeModal();
        }

      });

    }




  });