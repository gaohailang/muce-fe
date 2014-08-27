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
                // cleanup
                delete $rootScope.reportList;
                delete $rootScope.currentReport;

                $rootScope.categoryList = data;
                $scope.currentCategory = data[0];
                // Todo: 更新 ulr?! or resign by routeParam
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
        $scope.delTypes = ['group', 'category', 'dimension', 'metric'];
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

        $scope.delSelectedHandler = function() {
            var selectedItems = _.filter($scope.currentDelList, function(i) {
                return i.selected
            });
            var selected = _.pluck(selectedItems, 'name');
            if (!selected.length) return;

            function buildAlertStr() {
                var suffix;
                if (selected.length > 1) {
                    suffix = 'those ' + $scope.currentDelType + 's';
                } else {
                    suffix = 'this ' + $scope.currentDelType;
                }
                return 'Are you sure you wish to delete ' + suffix + ' :『' + selected.join(', ') + '』';
            }
            if (!window.confirm(buildAlertStr())) return;
            // use selectedItems to ids
            _.each(selectedItems, function(item) {
                apiHelper('del' + _.capitalize($scope.currentDelType), item.id).then(function(data) {
                    // remove from list
                    $scope.currentDelList = _.without($scope.currentDelList, item);
                    // remove from $rootScope.reportList, $rootScope.categoryList, $rootScope.groupList
                    if (_.contains(['group', 'category', 'report'], $scope.currentDelType)) {
                        $rootScope[$scope.currentDelType + 'List'] = _.without($rootScope[$scope.currentDelType + 'List'], item);
                    }
                });
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