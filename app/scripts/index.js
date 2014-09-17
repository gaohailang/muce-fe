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
            'report': {
                url: '/report',
                templateUrl: 'templates/report.html',
                controller: 'reportCtrl'
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
        $urlRouterProvider.otherwise('/report');
    });

    muceApp.config(function(uiSelectConfig) {
        uiSelectConfig.theme = 'select2';
    });

    muceApp.controller('feedbackCtrl', function($scope) {
        console.log('in feedbackCtrl');
    });

    angular.bootstrap(document, ['muceApp']);
});