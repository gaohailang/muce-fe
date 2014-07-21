define([], function() {

    // side - group->category-report list select
    function navbarCtrl(apiHelper, $scope) {
        apiHelper('getGroupList').then(function(data) {
            console.log(data);
        });

        // Todo: 更新 ulr?!

        // fetch group list, and default assign first group
        apiHelper.getGroupList().then(function(data) {
            $scope.groupList = data;
            $scope.currentGroup = data[0];
        });

        // update category list when user change select
        $scope.$watch('currentGroup', function(val) {
            if (!val) return;
            apiHelper('getCategoryList', {
                group_id: val
            }).then(function(data) {
                $scope.categoryList = data;
                // {id, name}
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
    function addModalCtrl() {

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
            apiHelper('get' + _.capitalize(val)).then(function(data) {
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

    angular.module('muceApp.report', [])
        .controller('reportCtrl', reportCtrl);
});