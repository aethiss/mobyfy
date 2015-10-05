// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('mobyfyApp', ['ionic', 'angularMoment', 'monospaced.elastic', 'mobyfyApp.mainControllers', 'mobyfyApp.groupControllers', 'mobyfyApp.services'])

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }

      // check if chat, then add on bottom 0px if keyboard is closed
      window.addEventListener('native.keyboardhide', function() {
        $('chat-text')[0].style.bottom = '0px';
      });


      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleLightContent();
      }
    });
  })

  .config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
      key: 'AIzaSyBSr910zvPL8mdDihtNda2Du381hDP8wGY',
      v: '3.17',
      libraries: 'places,geometry,visualization'
    });
  })

  .config(function($stateProvider, $urlRouterProvider) {

    // configure moment relative time
    moment.locale('en', {
      relativeTime: {
        future: "in %s",
        past: "%s ago",
        s: "%d sec",
        m: "a minute",
        mm: "%d minutes",
        h: "an hour",
        hh: "%d hours",
        d: "a day",
        dd: "%d days",
        M: "a month",
        MM: "%d months",
        y: "a year",
        yy: "%d years"
      }
    });


    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

      // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:

      .state('tab.dash', {
        url: '/dash',
        views: {
          'dash': {
            templateUrl: 'templates/dashboard.html',
            controller: 'MainCtrl'
          }
        }
      })

      .state('tab.groups', {
        url: '/groups',
        views: {
          'groups': {
            templateUrl: 'templates/groups.html',
            controller: 'GroupCtrl'
          }
        }
      })
      .state('tab.group-detail', {
        url: '/group/:groupId',
        views: {
          'groups': {
            templateUrl: 'templates/group-detail.html',
            controller: 'GroupDetailCtrl'
          }
        }
      })

      .state('tab.account', {
        url: '/account',
        views: {
          'account': {
            templateUrl: 'templates/account.html',
            controller: 'AccountCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');

  })

// fitlers
  .filter('nl2br', ['$filter',
    function($filter) {
      return function(data) {
        if (!data) return data;
        return data.replace(/\n\r?/g, '<br />');
      };
    }
  ]);


/* **********************************  */
/* ************ DIRECTIVE ***********  */
/* **********************************  */

/*
 * angular-elastic v2.4.2
 * (c) 2014 Monospaced http://monospaced.com
 * License: MIT
 */

angular.module('monospaced.elastic', [])

  .constant('msdElasticConfig', {
    append: ''
  })

  .directive('msdElastic', [
    '$timeout', '$window', 'msdElasticConfig',
    function($timeout, $window, config) {
      'use strict';

      return {
        require: 'ngModel',
        restrict: 'A, C',
        link: function(scope, element, attrs, ngModel) {

          // cache a reference to the DOM element
          var ta = element[0],
            $ta = element;

          // ensure the element is a textarea, and browser is capable
          if (ta.nodeName !== 'TEXTAREA' || !$window.getComputedStyle) {
            return;
          }

          // set these properties before measuring dimensions
          $ta.css({
            'overflow': 'hidden',
            'overflow-y': 'hidden',
            'word-wrap': 'break-word'
          });

          // force text reflow
          var text = ta.value;
          ta.value = '';
          ta.value = text;

          var append = attrs.msdElastic ? attrs.msdElastic.replace(/\\n/g, '\n') : config.append,
            $win = angular.element($window),
            mirrorInitStyle = 'position: absolute; top: -999px; right: auto; bottom: auto;' +
              'left: 0; overflow: hidden; -webkit-box-sizing: content-box;' +
              '-moz-box-sizing: content-box; box-sizing: content-box;' +
              'min-height: 0 !important; height: 0 !important; padding: 0;' +
              'word-wrap: break-word; border: 0;',
            $mirror = angular.element('<textarea tabindex="-1" ' + 'style="' + mirrorInitStyle + '"/>').data('elastic', true),
            mirror = $mirror[0],
            taStyle = getComputedStyle(ta),
            resize = taStyle.getPropertyValue('resize'),
            borderBox = taStyle.getPropertyValue('box-sizing') === 'border-box' ||
              taStyle.getPropertyValue('-moz-box-sizing') === 'border-box' ||
              taStyle.getPropertyValue('-webkit-box-sizing') === 'border-box',
            boxOuter = !borderBox ? {width: 0, height: 0} : {
              width:  parseInt(taStyle.getPropertyValue('border-right-width'), 10) +
              parseInt(taStyle.getPropertyValue('padding-right'), 10) +
              parseInt(taStyle.getPropertyValue('padding-left'), 10) +
              parseInt(taStyle.getPropertyValue('border-left-width'), 10),
              height: parseInt(taStyle.getPropertyValue('border-top-width'), 10) +
              parseInt(taStyle.getPropertyValue('padding-top'), 10) +
              parseInt(taStyle.getPropertyValue('padding-bottom'), 10) +
              parseInt(taStyle.getPropertyValue('border-bottom-width'), 10)
            },
            minHeightValue = parseInt(taStyle.getPropertyValue('min-height'), 10),
            heightValue = parseInt(taStyle.getPropertyValue('height'), 10),
            minHeight = Math.max(minHeightValue, heightValue) - boxOuter.height,
            maxHeight = parseInt(taStyle.getPropertyValue('max-height'), 10),
            mirrored,
            active,
            copyStyle = ['font-family',
              'font-size',
              'font-weight',
              'font-style',
              'letter-spacing',
              'line-height',
              'text-transform',
              'word-spacing',
              'text-indent'];

          // exit if elastic already applied (or is the mirror element)
          if ($ta.data('elastic')) {
            return;
          }

          // Opera returns max-height of -1 if not set
          maxHeight = maxHeight && maxHeight > 0 ? maxHeight : 9e4;

          // append mirror to the DOM
          if (mirror.parentNode !== document.body) {
            angular.element(document.body).append(mirror);
          }

          // set resize and apply elastic
          $ta.css({
            'resize': (resize === 'none' || resize === 'vertical') ? 'none' : 'horizontal'
          }).data('elastic', true);

          /*
           * methods
           */

          function initMirror() {
            var mirrorStyle = mirrorInitStyle;

            mirrored = ta;
            // copy the essential styles from the textarea to the mirror
            taStyle = getComputedStyle(ta);
            angular.forEach(copyStyle, function(val) {
              mirrorStyle += val + ':' + taStyle.getPropertyValue(val) + ';';
            });
            mirror.setAttribute('style', mirrorStyle);
          }

          function adjust() {
            var taHeight,
              taComputedStyleWidth,
              mirrorHeight,
              width,
              overflow;

            if (mirrored !== ta) {
              initMirror();
            }

            // active flag prevents actions in function from calling adjust again
            if (!active) {
              active = true;

              mirror.value = ta.value + append; // optional whitespace to improve animation
              mirror.style.overflowY = ta.style.overflowY;

              taHeight = ta.style.height === '' ? 'auto' : parseInt(ta.style.height, 10);

              taComputedStyleWidth = getComputedStyle(ta).getPropertyValue('width');

              // ensure getComputedStyle has returned a readable 'used value' pixel width
              if (taComputedStyleWidth.substr(taComputedStyleWidth.length - 2, 2) === 'px') {
                // update mirror width in case the textarea width has changed
                width = parseInt(taComputedStyleWidth, 10) - boxOuter.width;
                mirror.style.width = width + 'px';
              }

              mirrorHeight = mirror.scrollHeight;

              if (mirrorHeight > maxHeight) {
                mirrorHeight = maxHeight;
                overflow = 'scroll';
              } else if (mirrorHeight < minHeight) {
                mirrorHeight = minHeight;
              }
              mirrorHeight += boxOuter.height;
              ta.style.overflowY = overflow || 'hidden';

              if (taHeight !== mirrorHeight) {
                ta.style.height = mirrorHeight + 'px';
                scope.$emit('elastic:resize', $ta);
              }

              scope.$emit('taResize', $ta); // listen to this in the UserMessagesCtrl

              // small delay to prevent an infinite loop
              $timeout(function() {
                active = false;
              }, 1);

            }
          }

          function forceAdjust() {
            active = false;
            adjust();
          }

          /*
           * initialise
           */

          // listen
          if ('onpropertychange' in ta && 'oninput' in ta) {
            // IE9
            ta['oninput'] = ta.onkeyup = adjust;
          } else {
            ta['oninput'] = adjust;
          }

          $win.bind('resize', forceAdjust);

          scope.$watch(function() {
            return ngModel.$modelValue;
          }, function(newValue) {
            forceAdjust();
          });

          scope.$on('elastic:adjust', function() {
            initMirror();
            forceAdjust();
          });

          $timeout(adjust);

          /*
           * destroy
           */

          scope.$on('$destroy', function() {
            $mirror.remove();
            $win.unbind('resize', forceAdjust);
          });
        }
      };
    }
  ]);
