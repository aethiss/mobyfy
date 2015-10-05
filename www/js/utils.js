/**
 * Created by aethiss on 03/08/15.
 */

angular.module('ionic.utils', [])

  .factory('$localstorage', ['$window', function($window) {
    return {
      destroy: function(key) {
        $window.localStorage[key] = '';
      },
      set: function(key, value) {
        $window.localStorage[key] = value;
      },
      get: function(key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      setObject: function(key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function(key) {
        return JSON.parse($window.localStorage[key] || '{}');
      },
      existObject: function(key) {
        return ($window.localStorage[key] != "undefined")
      },
      isValidJson: function(key) {
        try {
          JSON.parse($window.localStorage[key]);
        } catch (e) {
          return false;
        }
        return true;
      }
    }
  }])

  .factory('$validate', function() {

    return {

      validateEmail: function(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
      },

      validateDate: function(date) {
        return !isNaN(Date.parse(date));
      },

      validatePwd: function(pwd) {
        if (typeof(pwd) != 'undefined' && pwd.length > 4) {
          return true;
        } else {
          return false;
        }
      }

    }

  })

  // Take image from REAL DEVICE ONLY
  .factory('$CameraHelper', function($cordovaCamera, $q) {


    return {

      takePicture: function(imageid) {

        var deferred = $q.defer();

        var options = {
          quality: 30,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 100,
          targetHeight: 100,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function(imageData) {
          var image = document.getElementById(imageid);
          image.src = "data:image/jpeg;base64," + imageData;

          console.log("ScreenShoot Done !!");
          //console.log(imageData);
          deferred.resolve({image: image, imgData: imageData});

        }, function(err) {
          // error
          console.log("error on Camera shoot : ", err);
          deferred.resolve(false);
        });


        return deferred.promise;
      },

      takeFakePicture: function(imageid) {

        var deferred = $q.defer();

        var img = document.getElementById(imageid);
        img.src = "./img/test/events/moto.jpg";
        img.onload = function(){
          deferred.resolve(img);
        }

        return deferred.promise;
      },

      getPicture: function(imageid) {

        var deferred = $q.defer();

        var options = {
          quality: 80,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: false,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 100,
          targetHeight: 100,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function(imageURI) {
          var image = document.getElementById(imageid);
          image.src = imageURI;
          console.log("img uri : ", imageURI);
          deferred.resolve({htmlImg: image, UriImg: imageURI});
        }, function(err) {
          // error
          console.log("error", err);
          deferred.resolve(false);
        });


        $cordovaCamera.cleanup().then(function(data) {
          console.log("camera cleanup : ", data);
        }); // only for FILE_URI

        return deferred.promise;
      }


    }

  });