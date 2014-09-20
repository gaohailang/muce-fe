define([
    'report/reportCtrl',
    'report/sidebarCtrl',
    'report/delPanelCtrl',
    'report/settingCtrl',
    'report/tableCtrl',
    'report/highchart',
    'report/resModal'
], function(reportCtrl, sidebarCtrl, delPanelCtrl, settingCtrl, tableCtrl, highchart) {

    var Config = {
        delAlertPrefix: 'Are you sure you wish to delete ',
        quickDataList: _.zip(
            'Last day,Last 2 days,Last 3 days,Last 1 week,Last 2 week,Last 1 month'.split(','), [-1, -2, -3, -7, -14, -31]
        ),
        periodFormatMap: {
            0: 'yyyy-MM-dd',
            1: 'yyyy-MM-dd hh:mm'
        },
        apiDateFormatMap: {
            0: 'yyyyMMdd',
            1: 'yyyyMMddhh'
        },
        csvFileNameTpl: '[MUCE REPORT] <%= report %> - <%= start %>_<%= end %>'
    };
    window.Config = Config;

    var routeInfo = {
        'report': {
            url: '/report',
            views: {
                'sidebar@report': {
                    templateUrl: 'templates/report/sidebar.html',
                    controller: 'sidebarCtrl'
                },
                'setting@report': {
                    templateUrl: 'templates/report/setting.html',
                    controller: 'settingCtrl'
                },
                '@': {
                    templateUrl: 'templates/report/index.html',
                    controller: 'reportCtrl'
                }
            }
        },
        'report.detail': {
            url: '/:group/:category/:report?startDate&endDate&period',
            templateUrl: 'templates/report/chart-table.html',
            controller: 'detailCtrl'
        },
        'view_metrics': {
            url: '/view_metrics',
            templateUrl: 'templates/report/view_metrics.html',
            controller: 'viewMetricsCtrl'
        }
    };

    function viewMetricsCtrl($scope, apiHelper, $rootScope) {
        apiHelper('getDetailMetricsList').then(function(data) {
            $scope.metricList = data;
        });

        $scope.delMetric = function(metric) {
            apiHelper('delMetric', metric.id).then(function() {
                var alertTip = Config.delAlertPrefix + 'metric ' + metric.name;
                if (!window.confirm(alertTip)) return;
                // remove metric from list
                $scope.metricList = _.without($scope.metricList, metric);
            });
        };

        $scope.editMetric = function(metric) {
            var newScope = $scope.$new(true);
            $scope._data = metric;

            $modal.open({
                templateUrl: 'templates/report/metric-tabs-modal.html',
                controller: 'metricModalCtrl',
                scope: $scope,
                size: 'lg'
            });
        };
    }

    function detailCtrl($scope, $state, apiHelper, $timeout, $filter, $rootScope) {
        var _state = $rootScope.state;
        _state.isAjaxFetching = false;
        $rootScope.$on('report:fetchReportData', function() {
            var defaultParams = {
                filters: [],
                cache: 1,
                dimensions: []
            };
            if (_state.isAjaxFetching) return;
            _state.isAjaxFetching = true;
            apiHelper('getReport', _state.report.id, {
                busy: 'global',
                params: _.extend(defaultParams, _.pick($state.params, 'period', 'startDate', 'endDate'))
            }).then(function(data) {
                highchart.buildLineChart(_state.reportDetail, data);
                $rootScope.$emit('report:renderReportData', [_state.reportDetail, data]);
                _state.isFetching = false;
                _state.isAjaxFetching = false;
            }, function() {});
        });
    }

    /* add modal */
    function addModalCtrl($scope, $modal) {
        $scope.addTypes = ['group', 'category', 'report', 'metric', 'dimension'];
        $scope.openModal = function(type) {
            if (type !== 'metric') {
                $modal.open({
                    templateUrl: 'templates/report/modal.html',
                    controller: type + 'ModalCtrl',
                    size: 'lg'
                });
            } else {
                $modal.open({
                    templateUrl: 'report/metric-tabs-modal.html',
                    size: 'lg'
                });
            }
        };
    }

    angular.module('muceApp.report', ['muceApp.report.resModal'])
        .controller('reportCtrl', reportCtrl)
        .controller('sidebarCtrl', sidebarCtrl)
        .controller('addModalCtrl', addModalCtrl)
        .controller('delPanelCtrl', delPanelCtrl)
        .controller('settingCtrl', settingCtrl)
        .controller('detailCtrl', detailCtrl)
        .controller('tableCtrl', tableCtrl)
        .config(function($stateProvider) {
            _.each(routeInfo, function(opt, name) {
                $stateProvider.state(name, opt);
            });
        });
});