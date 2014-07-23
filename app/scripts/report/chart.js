define(function() {
    // right - chart (currentReport - rootScope..)
    function chartPanelCtrl($scope, apiHelper, $rootScope, $modal) {
        // table, highchart, operator panel parts
        $scope.form = {};
        $scope.quickChooseList = _.object('Last day,Last 2days,Last 3days,Last 1week,Last 2week,Last 1month'.split(','), [-1, -2, -3, -7, -14, -31]);

        $scope.form.filters = []; // store process result
        $scope.dimenAdv = {
            dimensions: [],
            filterTypes: ['', 'EQUAL', 'NOT_EQUAL', 'CONTAINING', 'STARTSWITH', 'ENDSWITH', 'NOT_CONTAINING', 'NOT_STARTSWITH', 'NOT_ENDSWITH'],
            nowDimensionsType: [],
            nowDimensionsVal: [],
            saveFilters: function() {
                console.log($scope.dimenAdv);
                // trigger fetchReports
                _.each($scope.dimenAdv.nowDimensionsType, function(i, idx) {
                    // process (dimension, type, val) idx to got string
                });
            }
        };

        $scope.openAdvancedPanel = function() {
            // label by all dimensions
            $modal.open({
                templateUrl: 'templates/report/dimen-adv-modal.html',
                scope: $scope
            });
        };

        $rootScope.$watch('currentReport', function(val) {
            if (!val) return;
            // Todo: 更新 ulr?!
            apiHelper('getReportDetail', val.id).then(function(data) {
                console.log(data);
                $scope.currentReportDetail = data;
                $scope.dimenAdv.dimensions = data.dimensions; // sync for advanced modal
            });
        }, true);

        $scope.$watch('currentReportDetail', function(val) {
            if (!val) return;
            // Todo: 更新 ulr?! or reset by routeParam
            // set currentQuick
            // check period, and set default
        }, true);

        $scope.$watch('currentQuick', function(val) {
            if (!val) return;
            // set start_date, end_date, then fetchReport
            $scope.form.startDate = new Date().getTime() + (1000 * 60 * 60 * 24) * val;
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
                cache: 1,
                dimensions: []
            }).then(function(data) {
                // Todo: 更新 ulr?!
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

    return chartPanelCtrl;
});