define(function() {
    function mqCtrl($scope, apiHelper, $state, $stateParams) {
        $scope.$root.appTitle = 'MQ';

        $scope.changeDb = function(db) {
            $scope.allTables = [];
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
            apiHelper('getDbParts', db, tb, {
                busy: 'global'
            }).then(function(data) {
                $scope.tbInfo.partition = data ? data.reverse() : [];
            });
            // change to info state
            if (!$state.is('mq.info')) {
                $state.go('mq.info', {
                    database: db,
                    table: tb
                });
            }
        };

        $scope.switchTbView = function(view) {
            $scope.currentTbView = view;
        };

        $scope.currentTbView = 'schema';

        apiHelper('getDatabases').then(function(data) {
            $scope.allDbs = data;
        });

        if ($state.params.database && $state.params.table) {
            $scope.currentDb = $state.params.database;
            $scope.changeTable($state.params.table);
        }
    }

    angular.module('muceApp.mq.mqCtrl', [])
        .controller('mqCtrl', mqCtrl);
});