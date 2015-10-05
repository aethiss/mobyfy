angular.module('mobyfyApp.services', [])


  //  Local connection
  .constant("API_BASE_URL", "http://localhost:4000")
  //.constant("API_BASE_URL", "http://ec2-52-28-185-211.eu-central-1.compute.amazonaws.com:4000")

  .config(function ($httpProvider) {
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  })

  /* **********************************  */
  /* ************  LOGIN  *************  */
  /* **********************************  */

  .factory('LoginFactory', function($http, $q, $rootScope, API_BASE_URL) {

    var loginProvider = {

      getLogin: function(parameters) {

        var url = API_BASE_URL+'/api/login';

        var deferred = $q.defer();
        $http({
          method: 'GET',
          url: url,
          params: parameters
        })
          .success(function(data, status, headers, config) {
            //console.log("Success : ", status, data);
            deferred.resolve(data);
            user = data.params[0];
          })
          // this callback will be called asynchronously // when the response is available
          . error(function(data, status, headers, config) {
            // called asynchronously if an error occurs // or server returns response with an error status.
            console.log("Error : ", status, data);
            deferred.resolve(data);
          });

        return deferred.promise;
      }

    }

    return loginProvider;
  })

  /* **********************************  */
  /* ************  GROUPS  ************  */
  /* **********************************  */

  .factory('GroupsFactory', function($http, $q, $rootScope, API_BASE_URL) {

    var groups = [];

    return {

      all: function() {
        return groups;
      },

      remove: function(group) {
        groups.splice(groups.indexOf(group), 1);
      },

      delete: function(parameters) {
        var deferred = $q.defer();
        $http({
          method: 'POST',
          url: API_BASE_URL+'/api/groups/delete',
          params: parameters
        })
          .success(function(data, status, headers, config) {
            console.log("success", data);
            deferred.resolve(data);
          })
          . error(function(data, status, headers, config) {
            console.log("error", data);
            deferred.resolve(data);
          });

        return deferred.promise;
      },

      get: function(groupId) {
        for (var i = 0; i < groups.length; i++) {
          if (groups[i]._id === parseInt(groupId)) {
            return groups[i];
          }
        }
        return null;
      },

      setGroups: function(Allgroups) {
        groups = Allgroups;
        return null;
      },

      remoteGroups: function(parameters) {
        var deferred = $q.defer();
        $http({
          method: 'GET',
          url: API_BASE_URL+'/api/groups',
          params: parameters
        })
          .success(function(data, status, headers, config) {
            if (data.params.length > 0) {
              groups = data.params;
            }
            deferred.resolve(data);
          })
          . error(function(data, status, headers, config) {
            deferred.resolve(data);
          });

        return deferred.promise;
      },

      newGroup: function(parameters) {
        var deferred = $q.defer();
        $http({
          method: 'POST',
          url: API_BASE_URL+'/api/groups/new',
          params: parameters
        })
          .success(function(data, status, headers, config) {
            groups.push(data.params[0]);
            deferred.resolve(data);
          })
          .error(function(data, status, headers, config) {
            deferred.resolve(data);
          });

        return deferred.promise;
      }

    };
  })

  /* **********************************  */
  /* *************  CHAT  *************  */
  /* **********************************  */

  .factory('MockService', ['$http', '$q',
    function($http, $q) {
      var me = {};

      me.getUserMessages = function(d) {
        /*
         var endpoint =
         'http://www.mocky.io/v2/547cf341501c337f0c9a63fd?callback=JSON_CALLBACK';
         return $http.jsonp(endpoint).then(function(response) {
         return response.data;
         }, function(err) {
         console.log('get user messages error, err: ' + JSON.stringify(
         err, null, 2));
         });
         */
        var deferred = $q.defer();

        // TODO: request message queue here
        //setTimeout(function() {
        //  deferred.resolve(getMockMessages());
        //}, 1500);
        var msgs = {"messages":[]};
        deferred.resolve(msgs);


        return deferred.promise;
      };

      me.getMockMessage = function() {
        return {
          userId: '534b8e5aaa5e7afc1b23e69b',
          date: new Date(),
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
        };
      }

      return me;
    }
  ])

  .factory('$socket', function ($rootScope, API_BASE_URL) {
    var socket = io.connect(API_BASE_URL);
    var firstConnect = false;
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      },
      oneTime: function(eventName, callback) {
        socket.once(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      }
    };
  });
