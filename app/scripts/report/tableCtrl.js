define(function() {
    // @ngInject
    function tableCtrl($scope, $rootScope, $filter, $timeout) {
        var _state = $rootScope.state;
        var _tableDataPg = 1;
        var _allTableData = [],
            _reportDetail,
            _metricTypeMap = {},
            _pageSize = 50,
            _totalPg; // store all tableData
        $scope.tableRows = [];
        $rootScope.$on('report:renderReportData', function(event, opt) {
            // store full amount data inner
            var _tmp;
            _reportDetail = opt[0];
            _allTableData = opt[1];
            if (_reportDetail.transMetrics) {
                // 行列转置
                var tbFields = _reportDetail.transMetrics;
                $scope.tbFields = [{
                    id: 'date',
                    name: 'Date'
                }].concat(tbFields);
                $scope.tableRows = _allTableData.result;
            } else {
                // 普通的处理逻辑
                _.each(_reportDetail.metrics, function(i) {
                    _metricTypeMap[i.id] = i.type;
                });
                _totalPg = Math.ceil(_allTableData.result.length / _pageSize);
                buildGridHeader(_reportDetail, _allTableData);
                buildGridData();
            }
        });

        /* Data Table */
        function buildGridHeader(reportDetail, data) {
            // dependency: data['dimensions/metrics']
            function getNameById(i, type) {
                return _.find(reportDetail[type], function(d) {
                    return d.id == i;
                }).name;
            }

            var tbFields = [{
                id: 'date',
                name: 'Date'
            }];
            _.each(['dimensions', 'metrics'], function(type) {
                _.each(data[type], function(i) {
                    tbFields.push({
                        id: (type == 'metrics') ? i : 'd' + i,
                        name: getNameById(i, type)
                    });
                });
            });
            $timeout(function() {
                $scope.tbFields = tbFields;
            }, 20);
        }

        function buildGridData() {
            /*$scope.tableRows = _.map(data.result, function(i) {
                // we need date filter to format
                i.date = +(i.date);
                return i;
            });*/
            $timeout(function() {
                var _updates = _allTableData.result.slice(_pageSize * (_tableDataPg - 1), _pageSize * _tableDataPg);
                $scope.tableRows = $scope.tableRows.concat(_updates);
                $timeout(function() {
                    _state._fetchingReportTableData = false;
                    $('body').removeClass('i-stop-scrolling');
                }, 1200);
            }, 20);
        }

        $scope.loadMoreReportData = _.throttle(function() {
            console.log('fetching...');
            if (!_reportDetail || !_allTableData) return;
            if (_tableDataPg == _totalPg) return;
            _state._fetchingReportTableData = true;
            $('body').addClass('i-stop-scrolling');
            _tableDataPg += 1;
            buildGridData();
        }, 1000);

        $scope.sortReverse = false;
        $scope.toggleRowSort = function(type) {
            // use native sort method, instead of angular's filter orderBy
            $scope.sortType = type;
            $scope.sortReverse = !$scope.sortReverse;
            var tableRows = _.sortBy($scope.tableRows, function(item) {
                /*if ($scope.sortBy === 'date') {
                    // make date number to sort
                    return +item[type];
                }*/
                return item[type];
            });
            if ($scope.sortReverse) {
                tableRows.reverse();
            }
            $scope.tableRows = [];
            $timeout(function() {
                $scope.tableRows = tableRows;
            });
        };
        $scope.transReveres = false;
        $scope.toggleTransRowSort = function(type) {
            $scope.transReveres = !$scope.transReveres;
            $scope.transOrderType = '' + type;
        };

        $scope.exportTableAsCsv = function(tbFields, tableRows) {

            function buildCsvName() {
                return _.template(Config.csvFileNameTpl, {
                    report: _state.report.name,
                    start: $filter('date')(_state.startDate, 'yyyymmdd'),
                    end: $filter('date')(_state.endDate, 'yyyymmdd')
                }) + '.csv';
            }

            function buildCsvContent() {
                var resultArr = [],
                    csvContent;
                var ids = _.pluck(tbFields, 'id');
                resultArr.push(_.pluck(tbFields, 'name'));

                _.each(tableRows, function(row) {
                    resultArr.push(_.map(ids, function(key) {
                        if (key === 'date') {
                            try {
                                return $filter('dateNumFormat')(row[key]);
                            } catch (e) {
                                return row[key];
                            }
                        }
                        return row[key];
                    }));
                });

                csvContent = '"' + _.map(resultArr, function(rowArr, idx) {
                    return rowArr.join('","')
                }).join('"\r\n"') + '"';
                // http://stackoverflow.com/questions/23816005/anchor-tag-download-attribute-not-working-bug-in-chrome-35-0-1916-114
                /*return URL.createObjectURL(new Blob([csvContent], {
                    type: 'text/csv'
                }));*/
                return 'data:application/csv;charset=utf-8,' + encodeURIComponent(csvContent);
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

        $scope.getTdType = function(field, data) {
            if (field.id === 'date') return 'date';
            // check ratio/percent - green/red etc
            if (_.isNumber(field.id)) {
                if (data[field.id] == null) {
                    return 'empty';
                } else {
                    // Todo -
                    if (_metricTypeMap[field.id] === 2) {
                        return 'percent';
                    }
                    /*if (_metricTypeMap[field.id] === 1) {
                        return 'float';
                    }*/
                    return 'metric';
                }
            } else {
                return 'dimension';
            }
        };

        $scope.getTransType = function(field, data) {
            if (field.id === 'date') return 'date';
            if (data[field.id] == null) {
                return 'empty';
            }
            if (field.name.indexOf('Rate') > -1) {
                return 'divide';
            }
            if (field.name.indexOf('Diff') > -1) {
                return 'subtract';
            }
            return 'normal';
        };

        $scope.formatSubVal = function(val) {
            if (val > 0) {
                return '<b class="w-text-success">' + val + '</b>'
            } else {
                return '<b class="w-text-warning">' + val + '</b>'
            }
        };

        $scope.formatDivideVal = function(val) {
            var _val = $filter('percentage')(val);
            if (val > 0) {
                return '<b class="w-text-success">' + _val + '</b>'
            } else {
                return '<b class="w-text-warning">' + _val + '</b>'
            }
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

    return tableCtrl;
});