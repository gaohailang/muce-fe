define([
    'report/highchart',
    'report/echarts'
], function(highchart, echarts) {
    function chartPanelCtrl($scope, apiHelper, $rootScope, $modal, $filter, $timeout) {
        $scope.form = {};
        $scope.quickChooseList = _.zip('Last day,Last 2 days,Last 3 days,Last 1 week,Last 2 week,Last 1 month'.split(','), [-1, -2, -3, -7, -14, -31]);
        var periodFormatMap = {
            0: 'yyyy-MM-dd',
            1: 'yyyy-MM-dd hh:mm'
        };

        /* Dimen Advanced Modal */
        var dimenAdvModal;
        $scope.openAdvancedPanel = function() {
            dimenAdvModal = $modal.open({
                templateUrl: 'report/dimen-adv-modal.html',
                scope: $scope
            });
        };
        $scope.dimenAdv = {
            dimensions: [],
            filters: null,
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
                // Tdo: move to chartStateDiff
                self.filters ? fetchReports() : '';
                dimenAdvModal.close();
            },
            removeFilters: function() {
                this.filters = null;
            }
        };

        // 切换查看的 Report
        $rootScope.$watch('currentReport', function(val, old) {
            if (!val && !old) return;
            if (!val && old) {
                highchart.buildLineChart($scope.currentReportDetail, {
                    result: []
                });
                // echarts.buildLineChart($scope.currentReportDetail, []);
                return;
            }
            // Todo: update ulr?!
            apiHelper('getReportDetail', val.id, {
                cache: false,
                busy: 'global'
            }).then(function(data) {
                console.log('ReportDetail:', data);
                delete $scope.currentPeriod;
                delete $scope.currentQuick;
                $timeout(function() {
                    $scope.currentPeriod = data.periods[0];
                    $scope.currentQuick = -14; // last two week
                });
                $scope.currentReportDetail = data;
                $scope.dimenAdv.dimensions = data.dimensions; // sync for advanced modal
                // Todo: 更新 ulr?! or reset by routeParam
            });
        }, true);

        // 快速切换时间
        $scope.$watch('currentQuick', function(val) {
            if (!val) return;
            var _tmp = new Date();
            _tmp.setHours(0, 0, 0, 0);
            $scope.startDate = new Date(_tmp.getTime() + (1000 * 60 * 60 * 24) * val);
            $scope.endDate = _tmp;
            fetchReports();
        });
        $scope.onDateChnage = function() {
            // reset currentQuick
            $scope.currentQuick = '';
        };

        // 切换Period
        $scope.$watch('currentPeriod', function(val) {
            if (val === undefined) return;
            _.each($('.date-operator .quickdate-button'), function(i, ii) {
                var _tmp = $(i).scope();
                _tmp.disableTimepicker = val ? false : true;
                _tmp.labelFormat = periodFormatMap[val];
            });
            // Todo: change date range format to support hour/min etc
            fetchReports();
        });

        var isFetchReport = false;

        function fetchReports() {
            if (isFetchReport) return;
            isFetchReport = true;
            // Todo: check form validate
            var postData = {
                period: $scope.currentPeriod || 0,
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
                // echarts.buildLineChart($scope.currentReportDetail, data);
                buildGridData($scope.currentReportDetail, data);
                isFetchReport = false;
            }, function() {
                // Todo:
                /*
                    一、时间选择有范围限制：
                    1. "(period: day, w.o. dimension) interval should be less than two years”
                    2. "(period: day, with dimenison) interval should be less than 150 days”
                    3. "(period: hour) interval should be less than 30 days”
                    二、数据量有限制：
                    1000w行
                    "couldn't sort on big dataset, please reduce the date range!"
                */
            });
        };
        $scope.fetchReports = fetchReports;

        /* Data Table */
        function buildGridData(currentReport, data) {
            var heads = _.pluck(currentReport.metrics, 'name');
            heads.unshift('Date');
            var heads = _.map(heads, function(h) {
                return _.slugify(h);
            });
            var fieldNames = _.pluck(currentReport.metrics, 'name');
            fieldNames.unshift('Date');
            fieldNames = _.map(fieldNames, function(h) {
                return _.slugify(h);
            });

            var fieldIds = _.pluck(currentReport.metrics, 'id');
            fieldIds.unshift('date');

            $scope.tbFields = _.map(fieldIds, function(id, i) {
                return {
                    id: id,
                    name: fieldNames[i]
                };
            });
            $scope.tableRows = _.map(data.result, function(i) {
                _.each(_.keys(i), function(k) {
                    if (k !== 'date') {
                        // we need date filter to format
                        i[k] = +i[k];
                    }
                });
                return i;
            });
        }


        $scope.sortReverse = false;
        $scope.toggleRowSort = function(type) {
            // use native sort method, instead of angular's filter orderBy
            $scope.sortType = type;
            $scope.sortReverse = !$scope.sortReverse;
            var tableRows = _.sortBy($scope.tableRows, function(item) {
                if ($scope.sortBy === 'date') {
                    // make date number to sort
                    return +item[type];
                }
                return item[type];
            });
            if ($scope.sortReverse) {
                tableRows.reverse();
            }
            $scope.tableRows = tableRows;
        };

        $scope.exportTableAsCsv = function(tbFields, tableRows) {
            function buildCsvName() {
                // dirty
                return '[MUCE REPORT] ' + $scope.currentReportDetail.name + '-' + $filter('date')($scope.startDate, 'yyyymmdd') + '_' + $filter('date')($scope.endDate, 'yyyymmdd');
            }

            function buildCsvContent() {
                var resultArr = [],
                    csvContent;
                var ids = _.pluck(tbFields, 'id');
                resultArr.push(_.pluck(tbFields, 'name'));

                _.each(tableRows, function(row) {
                    resultArr.push(_.map(ids, function(key) {
                        return row[key];
                    }));
                });

                csvContent = _.map(resultArr, function(rowArr, idx) {
                    return rowArr.join(',')
                }).join('\n');
                // http://stackoverflow.com/questions/23816005/anchor-tag-download-attribute-not-working-bug-in-chrome-35-0-1916-114
                return URL.createObjectURL(new Blob([csvContent], {
                    type: 'text/csv'
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

            // open
            /*var newTab = window.open();
            $(newTab.document.body).html(csvContent.replace(/\n/g, '<br/>'));*/
            doMockLink();
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

            return dict;
        }
    }

    return chartPanelCtrl;
});