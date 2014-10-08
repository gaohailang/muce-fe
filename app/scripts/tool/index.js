define([], function() {

    var routeInfo = {
        'tool-uamp': {
            url: '/tool/ua-metric-platform',
            templateUrl: 'templates/tool/ua-metric-platform.html',
            controller: 'UAMPCtrl'
        }
    };

    function UAMPCtrl($scope, $rootScope, apiHelper, $filter) {
        // reportList
        // state.report, state.period, state.dimension, state.chartMetri, state.dateTime

        var flatMetricsData;

        function flattenReportMetric(metric, parent) {
            if (_.isArray(metric)) {
                _.each(metric, function(i) {
                    flattenReportMetric(i, parent);
                });
            } else {
                if (metric.data) {
                    if (parent) {
                        metric.parent = parent;
                    }
                    flatMetricsData.push(metric);
                }
                if (metric.child) {
                    flattenReportMetric(metric.child, metric.name);
                }
            }
        }

        $rootScope.state = {};
        var _state = $rootScope.state;
        _state.isSelectMetricMode = false;
        apiHelper('getUAMPReportList').then(function(data) {
            $scope.reportList = data;
            // first or from url
        }).then(function() {
            apiHelper('getUAMPReportDetail', 1).then(function(data) {
                _state.report = data;
            });
            apiHelper('getUAMPReportData', 1, {
                params: {
                    dimension: JSON.stringify([{
                        "id": 1,
                        "value": ["", "1"]
                    }, {
                        "id": 2,
                        "value": [""]
                    }]),
                    timespan: 1440
                }
            }).then(function(data) {
                flatMetricsData = [];
                flattenReportMetric(data.tableData);
                $scope.flatMetricsData = flatMetricsData;
                $scope.reportData = data;
            });
        });

        $scope.toggleMetricOpenStatus = function(metric) {
            metric.isopened = !metric.isopened;
            // ajaxxing~~~
            if (metric.haschild && (!metric.child)) {
                // 同时保留其他 param
                apiHelper('getUAMPReportData', metric.id).then(function(data) {
                    var _idx = _.indexOf($scope.flatMetricsData, metric);
                    flatMetricsData = [];
                    flattenReportMetric(data.tableData);
                    flatMetricsData.unshift(flatMetricsData.length);
                    flatMetricsData.unshift(_idx + 1);
                    Array.prototype.splice.apply($scope.flatMetricsData, flatMetricsData);
                });
            }
        };

        function findParentInFlat(child) {
            return _.find($scope.flatMetricsData, function(i) {
                return i.name === child.parent;
            });
        }

        $scope.inferFromParent = function(child) {
            if (!child.parent) return true;
            return findParentInFlat(child).isopened;
        };

        function inferMetricLevel(metric) {
            var level = 0;
            while (metric.parent) {
                level += 1;
                metric = findParentInFlat(metric);
            }
            return level;
        }

        $scope.setMetricLevelStyle = function(metric) {
            return {
                'padding-left': 20 * inferMetricLevel(metric)
            };
        };

        $scope.formatByType = function(val, idx) {
            var type = _.find($scope.reportData.tableTitle, function(th) {
                return th.alias === (idx + 1);
            });
            var ret = val;
            switch (type.data_diff) {
                case 'ratio':
                    ret = $filter('percentize')(val);
                case 'minus':
                    if (val > 0) {
                        ret = '<b class="metric-minus-up">' + ret + '</b>';
                    } else if (val < 0) {
                        ret = '<b class="metric-minus-down">' + ret + '</b>';
                    }
                default:
                    ret = ret;
            }
            return ret;
        };


        // Todo: 加个 Date Range 选择器在页面中~~

        $scope.renderChart = function() {
            var _state = $rootScope.state;

            _state.isShowChart = true;
        };

        $scope.chartConfig = {
            options: {
                chart: {
                    type: 'line', // spline
                    zoomType: 'x'
                }
            },
            series: [{
                data: [5146747.0000, 5616327.0000, 5628277.0000, 5632576.0000, 5974986.0000, 5127350.0000, 5158867.0000, 5127709.0000]
            }],
            xAxis: {
                categories: ["20140910", "20140911", "20140912", "20140913", "20140914", "20140915", "20140916", "20140917"],
            },
            title: {
                text: 'Hello' // 标题
            },
            loading: false
        };
    }

    // 1?timespan=1440&dateTime=20140921&dimensions=[{"id": 1, "value": ["", "1"]}, {"id": 2, "value": [""]}]

    angular.module('muceApp.tool', ['highcharts-ng'])
        .directive('uampCheckboxSelect', function($timeout) {
            // http://wenzhixin.net.cn/p/multiple-select/docs/#methods
            return {
                templateUrl: 'uamp-checkbox-select.html',
                link: function($scope, $elem, $attr) {
                    $timeout(function() {
                        $elem.find('select').multipleSelect({
                            allSelected: false
                        });
                    });
                },
                replace: true
            }
        })
        .controller('UAMPCtrl', UAMPCtrl)
        .config(function($stateProvider) {
            _.each(routeInfo, function(opt, name) {
                $stateProvider.state(name, opt);
            });
        });
});