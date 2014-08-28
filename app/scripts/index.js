require([
    './misc',
    'base/muceCom',
    'mq',
    './base',
    './api',
    'report/index'
], function(misc, MuceCom, Mq) {
    'use strict';

    var muceApp = angular.module('muceApp', [
        'ui.router',
        'ui.bootstrap',
        // 'ui.select',
        'ngSanitize',
        'ngQuickDate',
        'muceApp.api',
        'muceApp.base',
        'muceApp.report'
    ]);

    function tongji() {
        $('<img/>').attr('src', '/images/tongji.png');
    };

    muceApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
        $locationProvider.html5Mode(true).hashPrefix('!');
        // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
        $urlRouterProvider.otherwise('/');

        $stateProvider.state('index', {
            url: '/',
            templateUrl: 'templates/report.html',
            controller: 'reportCtrl'
        });
        _.each(MuceCom.moduleList, function(module) {
            $stateProvider.state(module, {
                url: '/' + module,
                templateUrl: 'templates/' + module + '.html',
                controller: module + 'Ctrl'
            });
        });
    });

    // muceApp.config(function(uiSelectConfig) {
    //     uiSelectConfig.theme = 'select2';
    // });

    muceApp.run(function() {
        // set window.userName which is required by ...
        window.userName = MuceCom.getNameFromCookie();
    });

    muceApp.controller('mqCtrl', function() {
        Mq.getInstance();
        MuceCom.updateTitle('Query');
        tongji();
    });

    muceApp.controller('feedbackCtrl', function($scope) {
        console.log('in feedbackCtrl');
    });

    angular.bootstrap(document, ['muceApp']);
});