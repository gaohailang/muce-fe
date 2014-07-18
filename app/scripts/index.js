require([
    './misc',
    './subscribe',
    'base/MuceCom'
], function(misc, Subscribe, MuceCom) {
    'use strict';

    var muceApp = angular.module('muceApp', ['classy', 'ui.router']);
    var moduleList = ['analytics', 'channels', 'dashboard', 'events', 'metrics', 'mq', 'report', 'subscribe'];

    // app.classy.controller(ctrl);
    // var reportCtrl = {
    //     name: '',
    //     inject: [],
    //     init: function() {

    //     },
    //     watch: {

    //     }
    // };

    function tongji() {
        $('<img/>').attr('src', '/images/tongji.png');
    };

    muceApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
        $locationProvider.html5Mode(true).hashPrefix('!')
        // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
        $urlRouterProvider.otherwise('/');

        $stateProvider.state('index', {
            url: '/',
            templateUrl: 'templates/report.html'
        });
        _.each(moduleList, function(module) {
            $stateProvider.state(module, {
                url: '/' + module,
                templateUrl: 'templates/' + module + '.html',
                controller: module + 'Ctrl'
            });
        });
    });

    muceApp.run(function() {

    });
    muceApp.controller('reportCtrl', function() {

    });

    muceApp.controller('subscribeCtrl', function() {
        Subscribe.getInstance();
        MuceCom.updateTitle('Subscribe');
        tongji();
    });

    angular.bootstrap(document, ['muceApp']);
});