define(['base/helper'], function(helper) {

    var routeInfo = {
        'tool-uamp': {
            url: '/tool/key-metrics',
            templateUrl: 'templates/tool/ua-metric-platform.html',
            controller: 'UAMPCtrl'
        },
        'tool-realtime-dashboard': {
            url: '/tool/realtime-dashboard',
            templateUrl: 'templates/tool/realtime-dashboard.html',
            itentifier: 'tool-realtime-dashboard',
            controller: 'realtimeDashboardCtrl'
        },
        'tool-realtime-dashboard-mgr': {
            url: '/tool/realtime-dashboard/admin',
            templateUrl: 'templates/tool/realtime-dashboard-mgr.html',
            itentifier: 'tool-realtime-dashboard',
            controller: 'realtimeDashboardCtrl'
        }
    };

    function realtimeDashboardCtrl($rootScope) {
        $rootScope.appTitle = '[Beta] - RealTime Dashboard';
    }

    function UAMPCtrl($scope, $rootScope, apiHelper, $filter, $timeout) {
        $rootScope.appTitle = 'Key Metrics#NOMUCE';
        // reportList 和 state.report, state.period, state.dimension, state.chartMetri, state.dateTime
        $scope.state = {
            isSelectMetricMode: false,
            hasFetchData: false
        };
        var flatMetricsData,
            _state = $scope.state;
        var $datePicker = $('.date-picker');
        var $chartDateRangePicker = $('.chart-date-range-picker');

        // init chart's date range picker first
        $chartDateRangePicker.daterangepicker({
            ranges: {
                'Last 7 Days': [moment().subtract('days', 6).toDate(), moment().toDate()],
                'Last 30 Days': [moment().subtract('days', 29).toDate(), moment().toDate()],
                'This Month': [moment().startOf('month').toDate(), moment().endOf('month').toDate()],
                'Last Month': [moment().subtract('month', 1).startOf('month').toDate(), moment().subtract('month', 1).endOf('month').toDate()]
            },
            format: 'YYYY-MM-DD',
            endDate: moment(),
            opens: 'left'
        });

        apiHelper('getUAMPReportList', {
            busy: 'global'
        }).then(function(data) {
            $scope.reportList = data;
            // first or from url
            $scope.selectReport(data[0].id);
        });

        // 左面切换 report
        $scope.selectReport = function(id) {
            if (_state.report && (_state.report.id === id)) return;
            _state.isShowChart = false;
            _state.isSelectMetricMode = false;
            _state.hasFetchData = false;
            apiHelper('getUAMPReportDetail', id).then(function(data) {
                _state.report = data;
                _state.report.id = id;
                _state.timespan = _state.report.timespan[0][0];
                _state.dimension = _.map(_state.report.dimension, function(d) {
                    return {
                        id: d.id,
                        value: ["((ALL))"]
                    };
                });
                $timeout(function() {
                    $scope.fetchReportData();
                }, 10);
                $timeout(function() {
                    setDimensionSelectVals();
                }, 500);
            });
        };

        // apply 请求 report table 数据
        $scope.fetchReportData = function() {
            callReportDataApi(_state.report.id).then(function(data) {
                flatMetricsData = [];
                flattenReportMetric(data.tableData);
                $scope.flatMetricsData = flatMetricsData;
                $scope.reportData = data;
                $timeout(function() {
                    _state.hasFetchData = true;
                }, 200);
            });
        };

        // 指标前面的+-控制 isOpen
        $scope.toggleMetricOpenStatus = function(metric) {
            metric.isopened = !metric.isopened;
            // ajaxxing~~~
            if (metric.haschild && (!metric.children)) {
                //  Todo --- 同时保留其他 param
                callReportDataApi(_state.report.id, metric.id).then(function(data) {
                    injectChildToReportData(metric, data.tableData);
                    flatMetricsData = [];
                    flattenReportMetric($scope.reportData.tableData);
                    $scope.flatMetricsData = flatMetricsData;
                });
            } else {
                loopArr(metric.children);
            }

            function loopArr(list) {
                _.each(list, function(row) {
                    row.isopened = false;
                    if (row.children) {
                        loopArr(row.children);
                    }
                });
            }
        };

        // 绘制趋势
        $scope.renderChart = function() {
            var idListSelected = _.pluck(_.filter($scope.flatMetricsData, function(i) {
                return i.selected;
            }), 'metricid');
            if (!idListSelected.length) return;
            _state.isShowChart = true;
            setChartDateRangeVal();
            $scope.fetchChartDataRender();
        };

        $scope.fetchChartDataRender = function() {
            var idListSelected = _.pluck(_.filter($scope.flatMetricsData, function(i) {
                return i.selected;
            }), 'id');
            if (!idListSelected.length) return;
            apiHelper('getUAMPChartData', {
                params: {
                    metricidDimensionidList: JSON.stringify(idListSelected),
                    reportid: _state.report.id,
                    timespan: _state.timespan,
                    dateTimeStart: dateRangerHelper.getStartVal(),
                    dateTimeEnd: dateRangerHelper.getEndVal()
                },
                busy: 'global'
            }).then(function(data) {
                // set chartConfig data option
                var dateList = _.map(data.dateTimeList, function(i) {
                    return helper.getUTCDateByDateAndPeriod(i);
                });
                delete data.dateTimeList;
                var _seriesData;
                if (_state.timespan === 43200) {
                    _seriesData = _.map(_.values(data), function(i) {
                        i.data = _.zip(dateList, i.data);
                        return i;
                    });
                } else {
                    _seriesData = _.map(_.values(data), function(i) {
                        i.pointInterval = _state.timespan * 60000;
                        i.pointStart = dateRangerHelper.getStartTime() + _state.timespan * 60000;
                        return i;
                    });
                }
                $scope.chartConfig = {
                    options: {
                        chart: {
                            type: 'spline',
                            zoomType: 'x'
                        }
                    },
                    series: _seriesData,
                    xAxis: {
                        type: 'datetime'
                    },
                    title: {
                        text: ""
                    },
                    loading: false,
                    lang: {
                        noData: '没有查询到相关数据'
                    },
                    noData: {
                        style: {
                            fontSize: '18px',
                            color: '#303030'
                        }
                    },
                    plotOptions: {
                        series: {
                            connectNulls: true
                        }
                    },
                    tooltip: {
                        crosshairs: true,
                        shared: true
                    },
                    credits: {
                        enabled: false
                    },
                    yAxis: {
                        title: {
                            text: null
                        }
                    }
                };
            });
        };

        // 导出 CSV
        $scope.exportCsv = function() {
            function buildCsvName() {
                var _i = _.find($scope.reportList, function(i) {
                    return i.id == _state.report.id;
                });
                return 'UA-Metric-Data-' + _i.name + ' ' + getDatePickerVal();
            }

            function buildCsvContent() {
                var resultArr = [],
                    csvContent;
                var names = _.pluck($scope.reportData.tableTitle, 'disp_name');
                resultArr.push(names);

                _.each($scope.flatMetricsData, function(row) {
                    var _row = [row.name].concat(row.data);
                    resultArr.push(_row);
                });

                csvContent = _.map(resultArr, function(rowArr, idx) {
                    return rowArr.join(',')
                }).join('\n');
                // http://stackoverflow.com/questions/23816005/anchor-tag-download-attribute-not-working-bug-in-chrome-35-0-1916-114
                return URL.createObjectURL(new Blob([csvContent], {
                    type: 'text/csv'
                    // ty:'application\/octet-stream'
                }));
            }

            function doMockLink() {
                var link = document.createElement("a");
                link.href = buildCsvContent();
                link.download = buildCsvName();
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            doMockLink();
        };

        // sort by name
        $scope.sortReverse = false;
        $scope.toggleRowSort = function(idx) {
            if (!_state.report.order) return;
            // use native sort method, instead of angular's filter orderBy
            $scope.sortType = idx;
            $scope.sortReverse = !$scope.sortReverse;
            var flatMetricsData;
            flatMetricsData = _.sortBy($scope.flatMetricsData, function(item) {
                if (idx === 0) {
                    return item.name;
                } else {
                    var _v = item.data[idx - 1];
                    if (_.isNaN(+_v)) {
                        return _v;
                    } else {
                        return +_v;
                    }
                }
            });
            if ($scope.sortReverse) {
                flatMetricsData.reverse();
            }
            $scope.flatMetricsData = flatMetricsData;
        };

        /* watchersss 监控~~ */

        // set datepicker jquery plugin
        $scope.$watch('state.timespan', function(timespan) {
            if (!timespan) return;
            _state.isShowChart = false;
            _state.isSelectMetricMode = false;
            var baseOpt = {
                autoclose: true,
                todayHighlight: true,
                endDate: new Date()
            };
            var timespanDPoptionMap = {
                1440: _.extend({}, baseOpt, {
                    format: 'yyyy-mm-dd'
                }),
                10080: _.extend({}, baseOpt, {
                    format: 'yyyy-mm-dd',
                    daysOfWeekDisabled: "0,2,3,4,5,6"
                }),
                43200: _.extend({}, baseOpt, {
                    format: 'yyyy-mm',
                    minViewMode: 'months',
                    startView: 'months'
                })
            };
            var prevFnMap = {
                1440: getPrevDay,
                10080: getPrevMonday,
                43200: getPrevMonth
            };
            $datePicker.datepicker('remove');
            $datePicker.datepicker(timespanDPoptionMap[timespan]);
            $datePicker.datepicker('setDate', prevFnMap[timespan].call());
        }, true);

        $chartDateRangePicker.on('apply.daterangepicker', function(ev, picker) {
            $scope.fetchChartDataRender();
        });

        // auto close chart when not select metric
        $scope.$watch('state.isSelectMetricMode', function(flag, old) {
            if (!old) return;
            if (!_state.isSelectMetricMode && _state.isShowChart) {
                _state.isShowChart = false;
                _.each($scope.flatMetricsData, function(i) {
                    return i.selected = false;
                });
            }
        });

        /* view helper */

        // metric name 层级 padding
        $scope.setMetricLevelStyle = function(metric) {
            return {
                'padding-left': 20 * inferMetricLevel(metric)
            };
        };

        // 看看该 row 是否被 parent collapse
        $scope.inferFromParent = function(children) {
            if (!children.parent) return true;
            return findParentInFlat(children).isopened;
        };

        // data cell 根据类型显示上升下降颜色和百分百
        $scope.isDiffCell = function(val, idx) {
            var type = $scope.reportData.tableTitle[idx + 1];
            return type.data_diff;
        };
        $scope.isDiffCellTh = function(type) {
            return type.data_diff;
        };
        $scope.formatByType = function(val, idx) {
            var type = $scope.reportData.tableTitle[idx + 1];
            var ret = val;
            switch (type.data_diff) {
                case 'ratio':
                    ret = $filter('percentize')(val, 2);
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

        // inner function
        function callReportDataApi(id, metricid) {
            // 依赖于_state.report 和 日期，dimension_选择情况 - check 下
            var _d = getDimensionSelectVals();
            return apiHelper('getUAMPReportData', id, {
                params: {
                    dimension: JSON.stringify(_d),
                    timespan: _state.timespan,
                    dateTime: getDatePickerVal(),
                    metricid: metricid
                },
                busy: 'global'
            });
        }

        function injectChildToReportData(metric, children) {
            loopArr($scope.reportData.tableData);

            function loopArr(list) {
                _.each(list, function(row) {
                    if (row.children) {
                        loopArr(row.children);
                    }
                    if (row.id === metric.id) {
                        row.children = children;
                    }
                });
            }
        }

        function findParentInFlat(children) {
            return _.find($scope.flatMetricsData, function(i) {
                return i.id === children.parent;
            });
        }

        function inferMetricLevel(metric) {
            var level = 0;
            while (metric.parent) {
                level += 1;
                metric = findParentInFlat(metric);
            }
            return level;
        }

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
                if (metric.children) {
                    flattenReportMetric(metric.children, metric.id);
                }
            }
        }

        // inner function for jquery-based component
        // jQuery 等 non-angular 代码 linked/binded:
        // datepicker 设置时间和取时间，diemsion select 设置和取值，daterangepicker 设置和取值
        // 从 datepicker input val 取得值，原始的 datepicker('getDate') 不 work
        function getPrevDay() {
            var x = new Date().getTime();
            return new Date(x - 1000 * 3600 * 24);
        }

        function getPrevMonday() {
            return moment().subtract(new Date().getDay() + 6, 'days').toDate();
        }

        function getPrevMonth() {
            var x = new Date();
            x.setDate(1);
            x.setMonth(x.getMonth() - 1);
            return x;
        }

        function getLast30Days() {
            return moment().subtract('days', 29).toDate();
        }

        function getDatePickerVal() {
            var _val = $datePicker.val();
            if (_state.timespan == 43200) {
                _val += '-01';
            }
            return _val.replace(/-/g, '');
        }

        function getDimensionSelectVals() {
            var _val = [];
            $('.uamp-checkbox-select select').each(function(idx, i) {
                _val.push({
                    id: $(i).data('dimension-id'),
                    value: $(i).multipleSelect('getSelects')
                });
            });
            _state.dimension = _val; // persistence for url serialized
            return _val;
        }

        function setDimensionSelectVals() {
            $('.uamp-checkbox-select select').each(function(idx, i) {
                $(i).multipleSelect('setSelects', ['((ALL))']);
            });
        }

        function setChartDateRangeVal() {
            var _picker = $chartDateRangePicker.data('daterangepicker');
            _picker.setEndDate(getPrevDay());
            _picker.setStartDate(getLast30Days());
        }

        var dateRangerHelper = {
            _inner: function(attr) {
                var _picker = $chartDateRangePicker.data('daterangepicker');
                return $filter('date')(_picker[attr].toDate().getTime(), 'yyyyMMdd');
            },
            getStartVal: function() {
                return this._inner('startDate');
            },
            getEndVal: function() {
                return this._inner('endDate');
            },
            getStartTime: function() {
                var _picker = $chartDateRangePicker.data('daterangepicker');
                return _picker.startDate.toDate().getTime();
            }
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
        .controller('realtimeDashboardCtrl', realtimeDashboardCtrl)
        .config(function($stateProvider) {
            _.each(routeInfo, function(opt, name) {
                $stateProvider.state(name, opt);
            });
        });
});