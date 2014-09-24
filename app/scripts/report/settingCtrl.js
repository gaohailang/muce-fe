define(function() {
    return function settingCtrl($scope, apiHelper, $timeout, $state, $rootScope, $filter, $modal) {
        var _state = $rootScope.state;

        $scope.quickChooseList = Config.quickDataList;

        $scope.$watch('state.report', function(report) {
            if (!report) return;

            apiHelper('getReportDetail', report.id, {
                busy: 'global'
            }).then(function(data) {
                if ($state.params.startDate && $state.params.endDate && $state.params.period) {
                    _.each(['startDate', 'endDate'], function(type) {
                        _state[type] = Helper.deSerApiDate($state.params[type], $state.params.period);
                    });
                    _state.period = $state.params.period;
                    fetchReports();
                } else {
                    $scope.currentQuick = 0;
                    $timeout(function() {
                        _state.period = data.periods[0];
                        $scope.currentQuick = -14; // last two week
                    });
                }
                _state.reportDetail = data;
            });
        }, true);

        $scope.$watch('currentQuick', function(val) {
            if (!val) return;
            var now = new Date();
            now.setHours(0, 0, 0, 0);
            _state.startDate = new Date(now.getTime() + (1000 * 60 * 60 * 24) * val);
            _state.endDate = now;
            fetchReports();
        });

        $rootScope.$watch('state.period', function(val) {
            if (val === undefined) return;
            _.each($('.date-operator .quickdate-button'), function(i, ii) {
                var _tmp = $(i).scope();
                _tmp.disableTimepicker = val ? false : true;
                _tmp.labelFormat = Config.periodFormatMap[val];
            });
            fetchReports();
        });

        $scope.onDateChnage = function() {
            // reset currentQuick
            $scope.currentQuick = '';
        };


        /* Dimen Advanced Modal */
        var dimenAdvModal;
        $scope.openAdvancedPanel = function() {
            dimenAdvModal = $modal.open({
                templateUrl: 'report/dimen-adv-modal.html',
                scope: $scope
            });
        };

        _state.dimenAdv = {
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

        _state.isFetching = false;

        function fetchReports() {
            if (!_state.startDate) return;
            if (_.isUndefined(_state.period)) return;
            if (_state.isFetching) return;
            _state.isFetching = true;
            $state.go('report.detail', {
                group: _state.group.name,
                category: _state.category.name,
                report: _state.report.name,
                startDate: Helper.serApiDate(_state.startDate, _state.period),
                endDate: Helper.serApiDate(_state.endDate, _state.period),
                period: _state.period
            });
            $timeout(function() {
                $rootScope.$emit('report:fetchReportData');
            });
            // $rootScope.emit
        }
        $scope.fetchReports = fetchReports;

        var Helper = {
            serApiDate: function(datetime, period) {
                return $filter('date')(datetime, Config.apiDateFormatMap[period]);
            },
            deSerApiDate: function(datetime, period) {
                var parseMap = {
                    '0': function(str) {
                        var y = str.substr(0, 4),
                            m = str.substr(4, 2) - 1,
                            d = str.substr(6, 2);
                        return new Date(y, m, d);
                    },
                    '1': function(str) {
                        var y = str.substr(0, 4),
                            m = str.substr(4, 2) - 1,
                            d = str.substr(6, 2),
                            h = str.substr(8, 2);
                        return new Date(y, m, d, h);
                    }
                }
                return parseMap[period](datetime)
            }
        };
    };
});