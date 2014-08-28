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

    muceApp.controller('mqCtrl', function($scope, apiHelper, $modal) {

        $scope.currentTbView = 'schema';

        apiHelper('getDatabases').then(function(data) {
            $scope.allDbs = data;
        });

        $scope.changeDb = function(db) {
            $scope.currentDb = db;
            apiHelper('getDbTable', db).then(function(data) {
                $scope.allTables = data;
            });
        };

        $scope.changeTable = function(tb) {
            var db = $scope.currentDb;
            $scope.currentTb = tb;
            $scope.tbInfo = {};
            apiHelper('getDbSchema', db, tb).then(function(data) {
                $scope.tbInfo.schema = data;
            });
            apiHelper('getDbParts', db, tb).then(function(data) {
                $scope.tbInfo.partition = data;
            });
        };

            });
        };

        $scope.

        Mq.getInstance();
        MuceCom.updateTitle('Query');
        tongji();


    });

    muceApp.controller('feedbackCtrl', function($scope) {
        console.log('in feedbackCtrl');
    });

    angular.bootstrap(document, ['muceApp']);
});