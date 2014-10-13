define(['report/highchart'], function(highchart) {
    // @ngInject
    function detailCtrl($scope, $state, apiHelper, $timeout, $filter, $rootScope) {
        var _state = $rootScope.state;
        _state.isAjaxFetching = false;
        console.log('detailCtrl');

        function triggerFetchDone(data) {
            $rootScope.$emit('report:renderReportData', [$rootScope.state.reportDetail, data]);
            _state.isFetching = false;
            _state.isAjaxFetching = false;
        }

        function _innerFetching() {
            var defaultParams = {
                filters: [],
                cache: true,
                dimensions: []
            };
            if (_state.isAjaxFetching) return;
            if(window._lastReportDataTime) {
                if((new Date().getTime() - window._lastReportDataTime) < 1000) return;
            }
            window._lastReportDataTime = new Date().getTime();
            _state.isAjaxFetching = true;
            console.log('getReport~~');
            apiHelper('getReport', $rootScope.state.report.id, {
                busy: 'global',
                params: _.extend(defaultParams, _.pick($state.params, 'period', 'startDate', 'endDate'))
            }).then(function(data) {
                highchart.buildLineChart($rootScope.state.reportDetail, data);
                if ($state.params.dimensions && ($state.params.dimensions != '[]')) {
                    // timeout to non-block ui
                    apiHelper('getReport', $rootScope.state.report.id, {
                        busy: 'global',
                        params: _.extend(defaultParams, _.pick($state.params, 'period', 'startDate', 'endDate', 'filters', 'dimensions'))
                    }).then(function(data) {
                        triggerFetchDone(data);
                    });
                } else {
                    triggerFetchDone(data);
                }
            }, function() {});
        }
        var innerFetching = _.throttle(_innerFetching, 1000);
        $rootScope.$on('report:fetchReportData', innerFetching);
    }

    return detailCtrl;
});