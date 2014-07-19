require([
    './misc',
    'old/analyze',
    'old/subscribe',
    'old/channels',
    'old/dashboard',
    'old/mq',
    'base/MuceCom',
    './base'
], function(misc, Analyze, Subscribe, Channels, Dashboard, Mq, MuceCom) {
    'use strict';

    var muceApp = angular.module('muceApp', [
        'classy', 'ui.router',
        'muceApp.base'
    ]);

    function tongji() {
        $('<img/>').attr('src', '/images/tongji.png');
    };

    muceApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
        $locationProvider.html5Mode(true).hashPrefix('!')
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

    muceApp.run(function() {
        // set window.userName which is required by ...
        window.userName = MuceCom.getNameFromCookie();
    });

    // most complicated reportCtrl with(profile, group etc)
    muceApp.controller('reportCtrl', function(apiHelper) {
        apiHelper.config({
            'getGroups': 'GET /meta/groups'
        });
        apiHelper('getGroups').then(function(data) {
            console.log(data);
        });
    });

    muceApp.controller('analyticsCtrl', function() {
        // Todo: 'analyze/:profile/:metric' : 'analyze',
        var profile = 1,
            metric = 1;
        Analyze.getInstance().updateSelectedProfile(profile, metric);

        MuceCom.updateTitle('Analyze');
        tongji();
    });

    muceApp.controller('subscribeCtrl', function() {
        // Todo: less occupied resources, scroll aniamtely, scroll leave space etc
        Subscribe.getInstance();

        MuceCom.updateTitle('Subscribe');
        tongji();
    });

    muceApp.controller('channelsCtrl', function() {
        Channels.getInstance();

        MuceCom.updateTitle('Channels');
        tongji();
    });

    muceApp.controller('dashboardCtrl', function() {
        Dashboard.getInstance().refresh();

        MuceCom.updateTitle('Dashboard');
        tongji();
    });

    muceApp.controller('mqCtrl', function() {
        Mq.getInstance();
        MuceCom.updateTitle('Query');
        tongji();
    });

    angular.bootstrap(document, ['muceApp']);
});