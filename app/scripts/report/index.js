define([
    'report/chart',
    'report/add'
], function(chartPanelCtrl) {

    function reportCtrl($scope) {
        // those variable is used across report module
    }

    /* type dropdown (group,category,report) */
    function navbarCtrl(apiHelper, $scope, $rootScope) {
        apiHelper('getGroupList', {
            busy: 'global'
        }).then(function(data) {
            $rootScope.groupList = data;
            $scope.currentGroup = data[0];
        });

        $scope.switchGroup = function(group) {
            $scope.currentGroup = group;
        };

        $scope.switchCategory = function(category) {
            $scope.currentCategory = category;
        };

        $scope.switchReport = function(report) {
            $rootScope.currentReport = report;
        };

        $scope.$watch('currentGroup', function(val) {
            if (!val) return;
            apiHelper('getCategoryList', {
                groupId: val.id
            }, {
                busy: 'global'
            }).then(function(data) {
                $rootScope.categoryList = data;
                // Todo: 更新 ulr?! or resign by routeParam
                $scope.currentCategory = data[0];
            });
        }, true);

        $scope.$watch('currentCategory', function(val) {
            if (!val) return;
            apiHelper('getReportList', {
                categoryId: val.id
            }, {
                busy: 'global'
            }).then(function(data) {
                $rootScope.reportList = data;
                $rootScope.currentReport = data[0];
            });
        }, true);
    }

    /* add modal */
    function addModalCtrl($scope, $modal) {
        $scope.addTypes = ['group', 'category', 'dimension', 'metric', 'report'];
        $scope.openModal = function(type) {
            if (type !== 'metric') {
                $modal.open({
                    templateUrl: 'templates/report/modal.html',
                    controller: type + 'ModalCtrl',
                    size: 'lg'
                });
            } else {
                $modal.open({
                    templateUrl: 'templates/report/metric-tabs-modal.html',
                    size: 'lg'
                });
            }
        };
    }

    /* delete widget */
    function delPanelCtrl(apiHelper, $scope, $timeout) {
        // scope: currentDelType, selectedItems, currentDelList, currentQuery
        $scope.delTypes = ['group', 'category', 'dimension', 'metric', 'categoryt_report_relation'];
        $scope.currentDelType = $scope.delTypes[0];

        $scope.$watch('currentDelType', function(val) {
            if (!val) return;
            resetType();
            apiHelper('get' + _.capitalize(val) + 'List').then(function(data) {
                $scope.currentDelList = data;
            });
        });

        function resetType() {
            $scope.currentQuery = '';
            $scope.currentDelList = [];
            // loading
        }

        // config select2 (with template, includes checkbox, selectedItems)
        $scope.delSelectedHandler = function() {
            // checkbox selectedItems exist, with notice?!
            // post and generate del opt differentiate by type
            apiHelper('del' + _.capitalize(currentDelType), {

            }, null).then(function(data) {

            });
        };
    }

    angular.module('muceApp.report', ['muceApp.report.add'])
        .controller('reportCtrl', reportCtrl)
        .controller('navbarCtrl', navbarCtrl)
        .controller('addModalCtrl', addModalCtrl)
        .controller('delPanelCtrl', delPanelCtrl)
        .controller('chartPanelCtrl', chartPanelCtrl);
});