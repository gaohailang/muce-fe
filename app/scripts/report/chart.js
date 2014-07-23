define([
    'report/highchart'
], function(highchart) {
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
            $scope.currentQuick = -7; // last week
            // Todo: 更新 ulr?! or reset by routeParam
            // check period, and set default
        }, true);

        $scope.$watch('currentQuick', function(val) {
            if (!val) return;
            // set start_date, end_date, then fetchReport
            $scope.startDate = new Date().getTime() + (1000 * 60 * 60 * 24) * val;
            $scope.endDate = new Date().getTime();
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
                // 构建 highchart
                highchart.buildLineChart($scope.currentReportDetail, data);
                // 构建 table
                buildGridData($scope.currentReportDetail, data);
            });
        };

        // build detail str(metric str) - show detail etc

        function buildGridData(currentReport, data) {
            var heads = _.pluck(currentReport.metrics, 'name');
            heads.unshift('Date');
            var xheads = _.map(heads, function(h) {
                return _.slugify(h);
            });
            $scope.tableHeads = _.object(xheads, heads);
            var rows = _.map(data.result, function(row) {
                // Todo: filter date to format
                return _.object(xheads, [row.date].concat(
                    _.values(_.omit(row, 'date'))
                ));
            });
            $scope.tableRows = rows;
        }

        $scope.sortReverse = false;
        $scope.toggleRowSort = function(type) {
            $scope.sortType = type;
            $scope.sortReverse = !$scope.sortReverse;
        };
    }

    return chartPanelCtrl;
});