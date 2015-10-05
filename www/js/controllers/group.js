/**
 * Created by aethiss on 03/08/15.
 */


/* **********************************  */
/* *********  GROUP CHAT  ***********  */
/* **********************************  */

angular.module('mobyfyApp.groupControllers', [])

  /* **********************************  */
  /* *********  SEARCH BOX  ***********  */
  /* **********************************  */
  .controller('searchBoxCtrl', function($scope, $rootScope) {

    console.log('search box controller');

    $scope.mapsData = {};

    $scope.loadPlaces = function() {
      //console.log($scope.mapsData.places);
      if ($scope.mapsData.places.length > 3) {
        $rootScope.loading = true;
      } else {
        $rootScope.loading = false;
      }
    }

    // Disable Tap for autoComplete
    $scope.disableTap = function(){
      var container = document.getElementsByClassName('pac-container');
      // disable ionic data tab
      angular.element(container).attr('data-tap-disabled', 'true');
      // leave input field if google-address-entry is selected
      angular.element(container).on("click", function(){
        console.log('click');
        document.getElementById('searchform').blur();
      });
    };

  })

  .controller('GroupDetailCtrl', function($scope, $rootScope, $state, $stateParams, $localstorage, $cordovaDatePicker,
                                        MockService, GroupsFactory, $socket,
                                        $ionicActionSheet, $ionicModal, $ionicPopup, $ionicScrollDelegate, $timeout, $interval) {


    // ***** 1) DEFINE USER And Model ***** //
    $scope.user = $rootScope.user;
    if (!$scope.user) {
      $state.go('tab.dash'); return;
    }
    $scope.user.pic = 'img/anonymous-picture.png';

    $scope.event = {
      title: "New Event",
      selected: false
    };

    $scope.getTitle = function() {
      if ($rootScope.loading) {
        return "Loading";
      } else {
        return $scope.event.title;
      }
    }

    //console.log($scope.user);

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

      // SEND on Socket user joined into namespace (room)
      if (typeof ($scope.group.token_id) != 'undefined') { // assuming if not undefined token, also id exist !
        $socket.emit('user:join', {
          room: $scope.group._id+"__"+$scope.group.token_id,
          user: $scope.user
        });
      } else {
        $state.go('tab.dash'); return; // TODO: Check if this is correct, maybe better move back on groups list and controll there!!!!
      }


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
      //$scope.getMessages();

      //messageCheckTimer = $interval(function() {
      //  // here you could check for new messages if your app doesn't use push notifications or user disabled them
      //}, 20000);
    });

    // **** BEFORE AND WHEN LEAVE CHAT  **** //
    $scope.$on('$ionicView.leave', function() {
      //console.log('leaving UserMessages view, destroying interval');
      // Make sure that the interval is destroyed
      //if (angular.isDefined(messageCheckTimer)) {
      //  $interval.cancel(messageCheckTimer);
      //  messageCheckTimer = undefined;
      //}

      $socket.emit('user:leave', {
        room: $scope.group._id+"__"+$scope.group.token_id,
      });


    });

    $scope.$on('$ionicView.beforeLeave', function() {
      if (!$scope.input.message || $scope.input.message === '') {
        $localstorage.destroy('userMessage-' + $scope.toUser._id);
        //localStorage.removeItem('userMessage-' + $scope.toUser._id);
      }

      // Reset tabs
      $('.tabs')[0].style.display = ''
    });



    //$scope.getMessages = function() {
    //  // the service is mock but you would probably pass the toUser's GUID here
    //  MockService.getUserMessages({
    //    toUserId: $scope.toUser._id
    //  }).then(function(data) {
    //    $scope.doneLoading = true;
    //    $scope.messages = data.messages;
    //
    //    $timeout(function() {
    //      viewScroll.scrollBottom();
    //    }, 0);
    //  });
    //};


    // ****** LISTEN ******* //
    // ***** MESSAGES ****** //

    // Listener User join on namespace (room)
    $socket.on("user:join", function(data) {
      console.log("user:join ", data);

      var joinMessage = {
        text: 'Joined in chat',
        userId: data.user._id,
        alias: data.user.alias,
        pic: data.user.pic,
        date: new Date(),
        time: new Date().getTime()
      }
      $scope.messages.push(joinMessage);

      $timeout(function() {
        viewScroll.scrollBottom(true);
      }, 0);

    });

    // Listener Last Messages (after join room)
    $socket.on("user.lastmessage", function(data) {
      //console.log('user.lastmessage ', data);

      var lastMsg = JSON.parse(data.message);
      console.log('user.lastmessage ', lastMsg);

      $scope.messages.push(lastMsg);
      $scope.messages = _.sortBy($scope.messages, 'time');

      $timeout(function() {
        viewScroll.scrollBottom(true);
      }, 0);

    });

    // Listener User Message on room
    $socket.on("user:message", function(data) {
      console.log("user:message ", data);

      var userMessage = {
        text: data.message.text,
        userId: data.message._id,
        alias: data.message.alias,
        pic: data.message.pic,
        date: data.message.date,
        time: data.message.time
      }

      $scope.messages.push(userMessage);

      $timeout(function() {
        viewScroll.scrollBottom(true);
      }, 0);

    });


    // ******* SEND ******* //
    // ***** MESSAGE ****** //

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
        date: new Date(),
        time: new Date().getTime()
      };

      //message._id = new Date().getTime(); // :~)
      //message.date = new Date();
      //message.username = $scope.user.username;
      //message.userId = $scope.user._id;
      //message.pic = $scope.user.pic;

      // if you do a web service call this will be needed as well as before the viewScroll calls
      // you can't see the effect of this in the browser it needs to be used on a real device
      // for some reason the one time blur event is not firing in the browser but does on devices
      keepKeyboardOpen();

      $scope.input.message = '';
      $scope.messages.push(message);
      console.log(message);

      // Controll is Grp exist, else block everything
      if (typeof ($scope.group._id) != 'undefined') {
        // Send Message via socket
        $socket.emit('user:message', {
          room: $scope.group._id+"__"+$scope.group.token_id,
          message: message
        });
      } else {
        $state.go('tab.dash'); return;
      }



      $timeout(function() {
        keepKeyboardOpen();
        viewScroll.scrollBottom(true);
      }, 0);

      //$timeout(function() {
      //  $scope.messages.push(MockService.getMockMessage());
      //  keepKeyboardOpen();
      //  viewScroll.scrollBottom(true);
      //}, 2000);

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

      //return;
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
    $scope.actions = function() {
      var hideSheet = $ionicActionSheet.show({

        titleText: 'Manage your group',
        buttons: [
          //{ text: '<b>Share</b> This' },
          { text: 'Propose Event' },
          { text: 'Add Friend' }
        ],
        buttonClicked: function(index) {
          console.log(index);
          if (index == 0) {
            $scope.createEvent();
          }
          hideSheet();
        },

        destructiveText: 'Delete Group',
        destructiveButtonClicked: function() {
          console.log("delete group ?");
        },

        cancelText: 'Cancel',
        cancel: function() {
          // add cancel code..
          hideSheet();
        }

      });
    };


    // *****  EVENTS  ***** //
    // Modal for new Event
    $ionicModal.fromTemplateUrl('templates/modals/new-event.html', {
      scope: $scope,
      animation: 'slide-in-down'
    }).then(function(modal) {
      $scope.modal = modal;
      $timeout(function() {
        $('#searchform').focus();
      }, 10);
    });

    $scope.closeEvent = function() {
      $scope.modal.hide();

      // Reset all !!
      $scope.showMap = true;
      $scope.showPlace = false;
      $scope.places = [];
      $scope.event.selected = false;
      $('#searchform').attr('value', '');

    }

    $scope.createEvent = function() {
      $scope.modal.show();
    };

    // *****  Maps Options ***** //
    //$scope.event = {
    //  selected: false
    //}
    $scope.showMap = true;
    $scope.showPlace = false;
    $scope.places = [];
    $scope.options = {scrollwheel: false};
    $scope.map = {
      "center": {
        "latitude": 43.1845960,
        "longitude": 13.6700010
      },
      "zoom": 16
    }; // TODO:  set location based on users current gps location

    $scope.marker = {
      id: 0,
      coords: {
        latitude: 43.1845960,
        longitude: 13.6700010
      },
      options: {
        draggable: false,
        //labelContent: "lat: " + $scope.map.center.latitude + ' ' + 'lon: ' + $scope.map.center.longitude,
        labelAnchor: "100 0",
        labelClass: "marker-labels"
      }
      //events: {
      //  dragend: function (marker, eventName, args) {
      //
      //    $scope.marker.options = {
      //      draggable: true,
      //      labelContent: "lat: " + $scope.marker.coords.latitude + ' ' + 'lon: ' + $scope.marker.coords.longitude,
      //      labelAnchor: "100 0",
      //      labelClass: "marker-labels"
      //    };
      //  }
      //}
    };

    var events = {
      places_changed: function (searchBox) {

        // Remove Loader
        $rootScope.loading = false;

        var place = searchBox.getPlaces();
        console.log(place);
        if (!place || place == 'undefined' || place.length == 0) {
          console.log('no place data :(');
          $scope.places = [];
          return;
        }

        $scope.map = {
          "center": {
            "latitude": place[0].geometry.location.lat(),
            "longitude": place[0].geometry.location.lng()
          },
          "zoom": 15
        };

        // Reset Markers
        $scope.marker = {
          id: 0,
          coords: {
            latitude: place[0].geometry.location.lat(),
            longitude: place[0].geometry.location.lng()
          },
          options: {
            draggable: false,
            //labelContent: "lat: " + $scope.map.center.latitude + ' ' + 'lon: ' + $scope.map.center.longitude,
            labelAnchor: "100 0",
            labelClass: "marker-labels"
          }
        };

        // reset places
        $scope.places = place;
        $scope.displayPlaces();

      }
    };
    $scope.searchbox = { template: 'searchbox.tpl.html', events: events };

    // list of places
    $scope.displayPlaces = function() {

      console.log($scope.places.length);
      if ($scope.places.length == 1) {
        $scope.event.selected = $scope.places[0];
        $timeout(function() {
          $('.placedetails').css('display', '');
        }, 10);
      }
      // hide map
      $scope.showMap = false;
    };


    $scope.selectPlace = function(selected, index) {

      $scope.showMap = false;
      console.log("Place selected : ", selected);

      // Reset placesdetails
      $('.placedetails').css('display', 'none');

      // Set Place Selected
      $scope.event.selected = selected;

      // Set New Marker
      $scope.marker = {
        id: 0,
        coords: {
          latitude: $scope.event.selected.geometry.location.lat(),
          longitude: $scope.event.selected.geometry.location.lng()
        },
        options: {
          draggable: false,
          //labelContent: "lat: " + $scope.map.center.latitude + ' ' + 'lon: ' + $scope.map.center.longitude,
          labelAnchor: "100 0",
          labelClass: "marker-labels"
        }
      }

      // Set Correct place on map
      $scope.map = {
        "center": {
          "latitude": $scope.event.selected.geometry.location.lat(),
          "longitude": $scope.event.selected.geometry.location.lng()
        },
        "zoom": 15
      };

      // display div
      $('#details'+index).css('display', '');
      // Reset Form
      $('#searchform')[0].value = '';
        //console.log("SELECTED FORMAT : ", $scope.event);

    };


    // Event Model
    $scope.openPicker = function() {

      console.log('open picker');

      var options = {
        date: new Date(),
        mode: 'date', // or 'time'
        //minDate: new Date() - 10000,
        minDate: new Date(),
        allowOldDates: false,
        allowFutureDates: true,
        doneButtonLabel: 'DONE',
        doneButtonColor: '#F2F3F4',
        cancelButtonLabel: 'CANCEL',
        cancelButtonColor: '#000000'
      };

      //$cordovaDatePicker.show(options).then(function(date){
      //  console.log(date);
      //});

    };


    $scope.confirmPlace = function() {

      console.log('confirmed :', $scope.event.selected);
      $scope.places = [$scope.event.selected];
      $('.placedetails').css('display', '');

    };

    $scope.confirmEvent = function() {

      console.log('Validate Event : ', $scope.event);

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