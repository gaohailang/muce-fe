define([
    'report/add'
], function() {

    function reportCtrl($scope) {
        // those variable is used across report module
        $scope.currentGroup = null;
        $scope.currentCategory = null;
        $scope.currentReport = null;
    }

    // side - group->category-report list select
    function navbarCtrl(apiHelper, $scope) {
        // Todo: 更新 ulr?!

        // fetch group list, and default assign first group
        apiHelper('getGroupList').then(function(data) {
            $scope.groupList = data;
            $scope.currentGroup = data[0];
        });

        $scope.switchGroup = function(group) {
            $scope.currentGroup = group;
        };

        $scope.switchCategory = function(category) {
            $scope.currentCategory = category;
        };

        $scope.switchReport = function(report) {
            $scope.currentReport = report;
        };

        // update category list when user change select
        $scope.$watch('currentGroup', function(val) {
            if (!val) return;
            apiHelper('getCategoryList', {
                group_id: val
            }).then(function(data) {
                $scope.categoryList = data;
                $scope.currentCategory = data[0];
            });
        });

        // update report List when user change select
        $scope.$watch('currentCategory', function(val) {
            if (!val) return;
            apiHelper('getReportList', {
                group_id: val
            }).then(function(data) {
                $scope.reportList = data;
                // {id, name}
            });
        });

        // currentGroup[groupList], currentCategory[categoryList], currentReport[reportList]
    }

    // add modal 内部
    function addModalCtrl($scope, $modal) {
        $scope.addTypes = ['group', 'category', 'dimension', 'metric', 'combineMetric', 'report'];
        $scope.openModal = function(type) {
            // support resolve
            var modalInstance = $modal.open({
                templateUrl: 'templates/report/modal.html',
                controller: type + 'ModalCtrl',
                size: 'lg' // '', sm
            });
        };
    }

    // right - chart (currentReport - rootScope..)
    function chartPanelCtrl() {
        // table, highchart, operator panel parts
    }

    // delete widget 内部
    function delPanelCtrl(apiHelper, $scope) {
        // scope: currentDelType, selectedItems, currentDelList
        $scope.delTypes = ['group', 'category', 'dimension', 'metric', 'categoryt_report_relation'];
        $scope.currentDelType = $scope.delTypes[0];

        $scope.$watch('currentDelType', function(val) {
            if (!val) return;
            apiHelper('get' + _.capitalize(val) + 'List').then(function(data) {
                $scope.currentDelList = data;
            });
        });

        // config select2 (with template, includes checkbox, selectedItems)

        $scope.delSelectedHandler = function() {
            // checkbox selectedItems exist, with notice?!
            // post and generate del opt differentiate by type
            apiHelper('del' + _.capitalize(currentDelType), {}).then(function(data) {

            });
        };
    }

    angular.module('muceApp.report', ['muceApp.report.add'])
        .controller('reportCtrl', reportCtrl)
        .controller('navbarCtrl', navbarCtrl)
        .controller('addModalCtrl', addModalCtrl)
        .controller('delPanelCtrl', delPanelCtrl);
});