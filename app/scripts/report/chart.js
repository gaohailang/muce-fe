define([
    'report/highchart'
], function(highchart) {
    function chartPanelCtrl($scope, apiHelper, $rootScope, $modal, $filter) {
        $scope.form = {};
        $scope.quickChooseList = _.object('Last day,Last 2days,Last 3days,Last 1week,Last 2week,Last 1month'.split(','), [-1, -2, -3, -7, -14, -31]);
        var periodFormatMap = {
            0: 'Y/m/d H:i',
            1: 'Y/m/d'
        };

        $scope.form.filters = [];

        /* Dimen Advanced Modal */
        $scope.openAdvancedPanel = function() {
            $modal.open({
                templateUrl: 'templates/report/dimen-adv-modal.html',
                scope: $scope
            });
        };
        $scope.dimenAdv = {
            dimensions: [],
            filters: [],
            filterTypes: ['', 'EQUAL', 'NOT_EQUAL', 'CONTAINING', 'STARTSWITH', 'ENDSWITH', 'NOT_CONTAINING', 'NOT_STARTSWITH', 'NOT_ENDSWITH'],
            nowDimensionsType: [],
            nowDimensionsVal: [],
            saveFilters: function() {
                var self = this;
                self.filters = [];
                _.each(self.dimensions, function(i, idx) {
                    // {"value":"1.0.0","key":"d1","operator":"EQUAL"}
                    if (self.nowDimensionsType[idx] && self.nowDimensionsVal[idx]) {
                        self.filters.push({
                            value: self.nowDimensionsVal[idx],
                            operator: self.nowDimensionsType[idx],
                            key: 'd' + i.id
                        });
                    }
                });
                self.filters.length ? fetchReports() : '';
            },
            removeFilters: function() {
                this.filters = [];
            }
        };

        // 切换查看的 Report
        $rootScope.$watch('currentReport', function(val) {
            if (!val) return;
            // Todo: update ulr?!
            apiHelper('getReportDetail', val.id, {
                cache: false,
                busy: 'global'
            }).then(function(data) {
                console.log(data);
                $scope.currentPeriod = data.periods[0];
                $scope.currentQuick = -7; // last week
                $scope.currentReportDetail = data;
                $scope.dimenAdv.dimensions = data.dimensions; // sync for advanced modal
                // Todo: 更新 ulr?! or reset by routeParam
            });
        }, true);
        // 快速切换时间
        $scope.$watch('currentQuick', function(val) {
            if (!val) return;
            $scope.startDate = new Date().getTime() + (1000 * 60 * 60 * 24) * val;
            $scope.endDate = new Date().getTime();
            fetchReports();
        });
        // 切换Period
        $scope.$watch('currentPeriod', function(val) {
            if (!val) return;
            // Todo: change date range format to support hour/min etc
            $('#report-start-date, #report-end-date').each(function(item) {
                $(this).data('xdsoft_datetimepicker').setOptions({
                    format: periodFormatMap[val],
                    timepicker: val ? true : false
                });
            });
            fetchReports();
        });

        function fetchReports() {
            // Todo: check form validate
            var postData = {
                period: $scope.currentPeriod || 1,
                startDate: $scope.startDate,
                endDate: $scope.endDate,
                filters: $scope.dimenAdv.filters || [],
                cache: 1,
                dimensions: []
            };
            postData = transDateFormatByPeriod(postData);
            apiHelper('getReport', $scope.currentReport.id, postData, {
                busy: 'global'
            }).then(function(data) {
                highchart.buildLineChart($scope.currentReportDetail, data);
                buildGridData($scope.currentReportDetail, data);
            });
        };
        $scope.fetchReports = fetchReports;

        /* Data Table */
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

        /* Utility */
        function transDateFormatByPeriod(dict) {
            var dateFormatMap = {
                1: 'yyyyMMddhh',
                0: 'yyyyMMdd'
            };
            _.each(['startDate', 'endDate'], function(key) {
                dict[key] = $filter('date')(dict[key], dateFormatMap[dict.period]);
            });
        }
    }

    return chartPanelCtrl;
});