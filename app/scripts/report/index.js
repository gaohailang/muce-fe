define([
    'report/highchart',
    'report/reportCtrl',
    'report/sidebarCtrl',
    'report/delPanelCtrl',
    'report/settingCtrl',
    'report/tableCtrl',
    'report/resModal',
    'report/management'
], function(highchart) {

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
            url: '/:group/:category/:report?startDate&endDate&period&dimensions&filters',
            templateUrl: 'templates/report/chart-table.html',
            controller: 'detailCtrl'
        },
        'report.management': {
            url: '^/management',
            abstract: true,
            views: {
                '@': {
                    templateUrl: 'templates/management/base.html',
                    controller: 'managementBaseCtrl'
                }
            }
        },
        'report.management.metric': {
            url: '/metric',
            views: {
                'pannel@report.management': {
                    templateUrl: 'templates/management/metric.html',
                    controller: 'viewMetricsCtrl'
                }
            }
        },
        'report.management.dimension': {
            url: '/dimension',
            views: {
                'pannel@report.management': {
                    templateUrl: 'templates/management/dimension.html',
                    controller: 'viewDimensionsCtrl'
                }
            }
        },
        'report.management.report': {
            url: '/report',
            views: {
                'pannel@report.management': {
                    templateUrl: 'templates/management/report.html',
                    controller: 'viewReportsCtrl'
                }
            }
        }
    };

    function detailCtrl($scope, $state, apiHelper, $timeout, $filter, $rootScope) {
        var _state = $rootScope.state;
        _state.isAjaxFetching = false;

        function triggerFetchDone(data) {
            $rootScope.$emit('report:renderReportData', [_state.reportDetail, data]);
            _state.isFetching = false;
            _state.isAjaxFetching = false;
        }

        $rootScope.$on('report:fetchReportData', function() {
            var defaultParams = {
                filters: [],
                cache: true,
                dimensions: []
            };
            if (_state.isAjaxFetching) return;
            _state.isAjaxFetching = true;
            apiHelper('getReport', _state.report.id, {
                busy: 'global',
                params: _.extend(defaultParams, _.pick($state.params, 'period', 'startDate', 'endDate'))
            }).then(function(data) {
                highchart.buildLineChart(_state.reportDetail, data);
                if ($state.params.dimensions && ($state.params.dimensions != '[]')) {
                    apiHelper('getReport', _state.report.id, {
                        busy: 'global',
                        params: _.extend(defaultParams, _.pick($state.params, 'period', 'startDate', 'endDate', 'filters', 'dimensions'))
                    }).then(function(data) {
                        triggerFetchDone(data);
                    });
                } else {
                    triggerFetchDone(data);
                }
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

    function buildCtrlDepArr(ctrlNames) {
        return _.map(ctrlNames, function(name) {
            return 'muceApp.report.' + name;
        });
    }

    angular.module('muceApp.report',
        buildCtrlDepArr(['delPanelCtrl', 'reportCtrl', 'sidebarCtrl', 'settingCtrl', 'tableCtrl']).concat(['muceApp.report.resModal', 'muceApp.report.management']))
        .controller('addModalCtrl', addModalCtrl)
        .controller('detailCtrl', detailCtrl)
        .config(function($stateProvider, $urlRouterProvider) {
            _.each(routeInfo, function(opt, name) {
                $stateProvider.state(name, opt);
            });
            $urlRouterProvider
                .when('/management', '/management/report')
        });
});