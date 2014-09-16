require([
    'base/index',
    'api',
    'report/index',
    'mq/index'
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
        'toaster',

        'muceApp.api',
        'muceApp.base',

        'muceApp.report',
        'muceApp.mq'
    ]);

    muceApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

        var routeInfo = {
            'index': {
                url: '/',
                templateUrl: 'templates/report.html',
                controller: 'reportCtrl'
            },
            'report': {
                url: '/report',
                templateUrl: 'templates/report.html',
                controller: 'reportCtrl'
            },
            'mq': {
                url: '/mq',
                abstract: true,
                templateUrl: 'templates/mq.html',
                controller: 'mqCtrl'
            },
            'mq.info': {
                url: '',
                templateUrl: '/templates/mq/tbinfo.html'
            },
            'mq.example': {
                url: '/example',
                templateUrl: '/templates/mq/example.html'
            },
            'mq.history': {
                url: '/history',
                templateUrl: '/templates/mq/history.html',
                controller: 'mqHistoryCtrl'
            },
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
        $urlRouterProvider.otherwise('/');
    });

    muceApp.config(function(uiSelectConfig) {
        uiSelectConfig.theme = 'select2';
    });

    muceApp.controller('feedbackCtrl', function($scope) {
        console.log('in feedbackCtrl');
    });

    angular.bootstrap(document, ['muceApp']);
});