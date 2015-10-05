/**
 * Created by aethiss on 03/08/15.
 */


/* **********************************  */
/* *********  GROUP CHAT  ***********  */
/* **********************************  */

angular.module('mobyfyApp.groupControllers', [])

.controller('GroupDetailCtrl', function($scope, $rootScope, $state, $stateParams, $localstorage,
                                        MockService, GroupsFactory, $socket,
                                        $ionicActionSheet, $ionicPopup, $ionicScrollDelegate, $timeout, $interval) {


    // ***** 1) DEFINE USER ***** //
    $scope.user = $rootScope.user;
    if (!$scope.user) {
      $state.go('tab.dash'); return;
    }
    $scope.user.pic = 'img/anonymous-picture.png';

    console.log($scope.user);

    // ***** 2) DEFINE GROUP ***** //
    $scope.group = {}; // this object will be update on $ionicView.enter (Step 6)


    // this could be on $rootScope rather than in $stateParams
    //$scope.user = {
    //  _id: '534b8fb2aa5e7afc1b23e69c',
    //  pic: 'http://ionicframework.com/img/docs/mcfly.jpg',
    //  username: 'Marty'
    //};

    //$scope.toUser = {
    //  _id: '534b8e5aaa5e7afc1b23e69b',
    //  pic: 'http://ionicframework.com/img/docs/venkman.jpg',
    //  username: 'Venkman'
    //}

    // TODO: Remove after test
    $scope.toUser = {
      _id: '534b8e5aaa5e7afc1b23e69b',
      pic: 'http://ionicframework.com/img/docs/venkman.jpg',
      alias: 'Venkman'
    }


    // ***** 3) DEFINE MSG QUEUE ***** //
    $scope.messages = [];

    // ***** 4) DEFINE INPUT ***** //
    $scope.input = {
      message: $localstorage.get('userMessage-' + $scope.toUser._id) || ''
    };

    // ***** 5) INITIALIZE DOM ELEMENTS ***** //
    //var messageCheckTimer;
    var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
    var footerBar; // gets set in $ionicView.enter
    var scroller;
    var txtInput; // ^^^

    //  ***** 6) SET DOM ELEMENTS ON VIEW ENTER, ALSO CHECK IF USER EXIST ***** //
    $scope.$on('$ionicView.enter', function() {
      console.log('UserMessages $ionicView.enter');

      // move back if user is not set (not logged)
      if (!$scope.user) {
        $state.go('tab.dash'); return; // TODO: Check if this is correct, maybe better move back on groups list and controll there!!!!
      }

      // set up Group details
      $scope.group = GroupsFactory.get($stateParams.groupId);
      console.log($scope.group);


      // ***** DOM ELEMENTS UPDATE AFTER ENTER ***** //
      // hide Tabs
      $('.tabs')[0].style.display = 'none';
      $('.chat-text')[0].style.bottom = '0px';

      $timeout(function() {
        footerBar = document.body.querySelector('#userMessagesView .bar-footer');
        scroller = document.body.querySelector('#userMessagesView .scroll-content');
        txtInput = angular.element(footerBar.querySelector('textarea'));
      }, 0);

      // TODO : this message will be pulled from reddis queue (Server side)
      $scope.getMessages();

      //messageCheckTimer = $interval(function() {
      //  // here you could check for new messages if your app doesn't use push notifications or user disabled them
      //}, 20000);
    });

    // **** BEFORE AND WHEN LEAVE CHAT  **** //
    $scope.$on('$ionicView.leave', function() {
      console.log('leaving UserMessages view, destroying interval');
      // Make sure that the interval is destroyed
      //if (angular.isDefined(messageCheckTimer)) {
      //  $interval.cancel(messageCheckTimer);
      //  messageCheckTimer = undefined;
      //}
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      if (!$scope.input.message || $scope.input.message === '') {
        $localstorage.destroy('userMessage-' + $scope.toUser._id);
        //localStorage.removeItem('userMessage-' + $scope.toUser._id);
      }

      // Reset tabs
      $('.tabs')[0].style.display = ''
    });



    $scope.getMessages = function() {
      // the service is mock but you would probably pass the toUser's GUID here
      MockService.getUserMessages({
        toUserId: $scope.toUser._id
      }).then(function(data) {
        $scope.doneLoading = true;
        $scope.messages = data.messages;

        $timeout(function() {
          viewScroll.scrollBottom();
        }, 0);
      });
    };

    $scope.$watch('input.message', function(newValue, oldValue) {
      //console.log('input.message $watch, newValue ' + newValue);
      if (!newValue) newValue = '';
      //localStorage['userMessage-' + $scope.toUser._id] = newValue;
      $localstorage.set('userMessage-' + $scope.toUser._id, newValue);
    });

    $scope.sendMessage = function(sendMessageForm) {
      var message = {
        //toId: $scope.toUser._id,
        text: $scope.input.message,
        userId: $scope.user._id,
        alias: $scope.user.alias,
        pic: $scope.user.pic,
        date: new Date()
      };

      // if you do a web service call this will be needed as well as before the viewScroll calls
      // you can't see the effect of this in the browser it needs to be used on a real device
      // for some reason the one time blur event is not firing in the browser but does on devices
      keepKeyboardOpen();

      //MockService.sendMessage(message).then(function(data) {
      $scope.input.message = '';

      //message._id = new Date().getTime(); // :~)
      //message.date = new Date();
      //message.username = $scope.user.username;
      //message.userId = $scope.user._id;
      //message.pic = $scope.user.pic;

      console.log(message);

      $scope.messages.push(message);

      $timeout(function() {
        keepKeyboardOpen();
        viewScroll.scrollBottom(true);
      }, 0);

      //$timeout(function() {
      //  $scope.messages.push(MockService.getMockMessage());
      //  keepKeyboardOpen();
      //  viewScroll.scrollBottom(true);
      //}, 2000);

      //});
    };

    // this keeps the keyboard open on a device only after sending a message, it is non obtrusive
    function keepKeyboardOpen() {
      console.log('keepKeyboardOpen');
      txtInput.one('blur', function() {
        console.log('textarea blur, focus back on it');
        txtInput[0].focus();
      });
    }

    $scope.onMessageHold = function(e, itemIndex, message) {
      console.log('onMessageHold');
      console.log('message: ' + JSON.stringify(message, null, 2));
      $ionicActionSheet.show({
        buttons: [{
          text: 'Copy Text'
        }, {
          text: 'Delete Message'
        }],
        buttonClicked: function(index) {
          switch (index) {
            case 0: // Copy Text
              //cordova.plugins.clipboard.copy(message.text);

              break;
            case 1: // Delete
              // no server side secrets here :~)
              $scope.messages.splice(itemIndex, 1);
              $timeout(function() {
                viewScroll.resize();
              }, 0);

              break;
          }

          return true;
        }
      });
    };

    // this prob seems weird here but I have reasons for this in my app, secret!
    //$scope.viewProfile = function(msg) {
    //  if (msg.userId === $scope.user._id) {
    //    // go to your profile
    //  } else {
    //    // go to other users profile
    //  }
    //};

    // I emit this event from the monospaced.elastic directive, read line 480
    $scope.$on('taResize', function(e, ta) {

      return;
      //console.log('taResize');
      if (!ta) return;

      var taHeight = ta[0].offsetHeight;
      //console.log('taHeight: ' + taHeight);

      if (!footerBar) return;

      var newFooterHeight = taHeight + 10;
      newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

      footerBar.style.height = newFooterHeight + 'px';
      scroller.style.bottom = newFooterHeight + 'px';
    });



    // *****  OPTIONS  ***** //
    $scope.options = function() {
      console.log('called options');
    };


  })

  /* **********************************  */
  /* *********  GROUP LIST  ***********  */
  /* **********************************  */

  .controller('GroupCtrl', function($scope, $rootScope, $state, $stateParams,
                                    $ionicModal, $ionicPopup, $ionicLoading,
                                    $localstorage, GroupsFactory) {

    $scope.$on('$ionicView.enter', function() {
      if (!$rootScope.user) {
        console.log($rootScope.user);
        $state.go('tab.dash');
      } else {
        $scope.groups = GroupsFactory.all();
        console.log($scope.groups);
      }
    });

    $scope.remove = function(Group) {
      if ($scope.isAdmin(Group._id)) {

        var confirmPopup = $ionicPopup.confirm({
          title: 'Delete '+Group.title,
          template: 'Are you sure you want delete : <br/>'+Group.title
        });
        confirmPopup.then(function(res) {
          if(res) {
            GroupsFactory.remove(Group);
            GroupsFactory.delete(Group);
          } else {
            //console.log('You are not sure');
          }
        });

      } else {
        $ionicPopup.alert({
          title: 'Error',
          template: 'Only Admin can delete : <br> '+Group.title
        });
      }

    };

    // New Group

    // model
    $scope.groupData = {
      invite: false,
      private: false,
      image: 'img/anonymous-picture.png' // standard image
    };
    $scope.submitted = false;

    $scope.isAdmin = function(groupId) {
      var selectGrp = GroupsFactory.get(groupId);
      //console.log(groupId, selectGrp);

      if (selectGrp != 'null' && selectGrp.owner_id == $rootScope.user._id) {
        return true;
      } else {
        return false;
      }
    };

    //  initialize new group modal
    $ionicModal.fromTemplateUrl('templates/modals/new-group.html', {
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
    $scope.newGroup = function() {
      $scope.openModal();
    };
    $scope.closeNewGroup = function() {
      // reset model
      $scope.groupData = { invite: false, private: false, image: 'img/anonymous-picture.png' };
      $scope.submitted = false;
      $scope.closeModal();
    };

    $scope.isOpen = function() {
      return $scope.groupData.private;
    }

    $scope.isFree = function() {
      return $scope.groupData.invite;
    }

    $scope.setJoin = function() {
      if ($scope.groupData.private) {
        $scope.groupData.invite = true;
      }
    }

    $scope.validateName = function() {
      if (typeof($scope.groupData.title) != 'undefined' && $scope.groupData.title.length > 3) {
        return true;
      } else {
        return false;
      }
    }

    $scope.createGroup = function() {

      // Force data if undefined
      if (typeof ($scope.groupData.private) == 'undefined') { $scope.groupData.private = false; }
      if (typeof ($scope.groupData.invite) == 'undefined') { $scope.groupData.invite = false; }
      if (typeof ($scope.groupData.image) == 'undefined') { $scope.groupData.image = 'img/anonymous-picture.png' }

      $scope.submitted = true;


      if ($scope.validateName()) {
        console.log("ADD NEW GRP : ", $scope.groupData, $rootScope.user);

        $ionicLoading.show({
          template: 'Save new Group on Server...'
        });

        $scope.groupData.user_id = $rootScope.user._id;
        GroupsFactory.newGroup($scope.groupData).then(function(data) {
          console.log(data);
          $scope.groups = GroupsFactory.all();
          $scope.closeNewGroup();
          $ionicLoading.hide();

          // Update Local Memory
          $localstorage.setObject('groups', $scope.groups);
        })

      }

    };



  });