require.config({
    baseUrl: '/scripts',
    paths: {
        'bower': '../components'
    },
    shim: {
        'highcharts': {
            'exports': 'Highcharts'
        },
        'highcharts_nodata': {
            'deps': ['highcharts'],
            'exports': 'highcharts_nodata'
        }
    }
});

require([
    'base/index',
    'api',
    'report/index',
    'mq/index',
    'tool/index'
], function() {
    'use strict';

    var muceApp = angular.module('muceApp', [
        'ngSanitize',
        'ngAnimate',

        'ui.router',
        'ui.bootstrap',
        'ui.codemirror',
        'ui.select',
        'ngQuickDate',
        'pasvaz.bindonce',
        'infinite-scroll',
        'toaster',
        'QuickList',

        'muceApp.api',
        'muceApp.base',

        'muceApp.report',
        'muceApp.mq',
        'muceApp.tool',
        'muceApp.templates'
    ]);

    muceApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

        var routeInfo = {
            'feedback': {
                url: '/feedback',
                templateUrl: 'templates/feedback.html'
            }
        };

        _.each(routeInfo, function(opt, name) {
            $stateProvider.state(name, opt);
        });

        // $locationProvider.html5Mode(true).hashPrefix('!');
        // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
        $urlRouterProvider.otherwise('/report');
    });

    muceApp.config(function(uiSelectConfig) {
        uiSelectConfig.theme = 'select2';
    });

    muceApp.controller('baseCtrl', function($scope, $state) {
        $scope.$state = $state;
    }).controller('feedbackCtrl', function($scope) {
        console.log('in feedbackCtrl');
    });

    angular.bootstrap(document, ['muceApp']);
});