define([
    'report/add'
], function() {

    function reportCtrl($scope) {
        // those variable is used across report module
        // $scope.currentGroup = null;
        // $scope.currentCategory = null;
        // $scope.currentReport = null;
    }

    // side - group->category-report list select
    function navbarCtrl(apiHelper, $scope, $rootScope) {
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
            $rootScope.currentReport = report;
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
                $rootScope.currentReport = data[0];
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
    function chartPanelCtrl($scope, apiHelper, $rootScope, $modal) {
        // table, highchart, operator panel parts
        $scope.form = {};
        $scope.quickChooseList = _.object('Last day,Last 2days,Last 3days,Last 1week,Last 2week,Last 1month'.split(','), [-1, -2, -3, -7, -14, -31]);

        $scope.openAdvancedPanel = function() {
            // label by all dimensions
            $modal.open({
                templateUrl: '',
                resolve: {
                    // current Dimensions
                    // operator list
                },
                controller: 'dimenAdvCtrl'
            });
        };

        $rootScope.$watch('currentReport', function(val) {
            if (!val) return;
            // bug mocky data
            apiHelper('getReportDetail', val.id).then(function(data) {
                console.log(data);
                $scope.currentReportDetail = data;
            });
        }, true);

        $scope.$watch('currentReportDetail', function(val) {
            if (!val) return;
            // set currentQuick
            // check period, and set default
        }, true);

        $scope.$watch('currentQuick', function(val) {
            if (!val) return;
            // set start_date, end_date, then fetchReport
            $scope.form.startDate = new Date().getTime() + (1000*60*60*24)*val;
            $scope.form.endDate = new Date().getTime();
            $scope.fetchReports();
        });

        $scope.$watch('currentPeriod', function(val) {
            if (!val) return;
            $scope.fetchReports();
        });

        // use click to apply
        $scope.fetchReports = function() {
            // check form validate
            apiHelper('getReport', $scope.currentReport.id, {
                period: 'hour',
                start_date: '',
                end_date: '',
                filters: [],
                cache:1,
                dimensions: []
            });
        };

        // filters

        // build detail str(metric str) - show detail etc

        // /report/{report_id}?period={period}&start_date={start_date}&end_date={end_date}&dimensions={dimensions}&filters={json}&offset={offset}&size={size}&cache=true/false

        /*
            period
            start_date, end_date <- quickType
            dimensions
            filters <- advanced
            cache=1

            filters: [{"value":"1.0.0","key":"d1","operator":"EQUAL"},{"value":"wandoujia","key":"2","operator":"STARTSWITH"}]
        */
    }

    // delete widget 内部
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
            apiHelper('del' + _.capitalize(currentDelType), {}).then(function(data) {

            });
        };
    }


    function dimenAdvCtrl() {

    }

    angular.module('muceApp.report', ['muceApp.report.add'])
        .controller('reportCtrl', reportCtrl)
        .controller('navbarCtrl', navbarCtrl)
        .controller('addModalCtrl', addModalCtrl)
        .controller('delPanelCtrl', delPanelCtrl)
        .controller('chartPanelCtrl', chartPanelCtrl)
        .controller('dimenAdvCtrl', dimenAdvCtrl);
});