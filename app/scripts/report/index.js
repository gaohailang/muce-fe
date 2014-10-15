define([
    'report/baseCtrl',
    'report/sidebarCtrl',
    'report/delPanelCtrl',
    'report/settingCtrl',
    'report/detailCtrl',
    'report/tableCtrl',
    'report/resModal',
    'report/management'
], function(reportBaseCtrl, sidebarCtrl, delPanelCtrl, settingCtrl, detailCtrl, tableCtrl) {

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
    // WTF?! Name Conflict!!!
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
                    controller: 'reportBaseCtrl'
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

    /* add modal */
    function addModalCtrl($scope, $modal) {
        $scope.addTypes = ['group', 'category', 'report', 'metric', 'dimension'];
        $scope.openModal = function(e, type) {
            e.preventDefault();
            if (type !== 'metric') {
                $modal.open({
                    templateUrl: 'templates/report/modal.html',
                    controller: type + 'ModalCtrl',
                    size: 'lg'
                });
            } else {
                $modal.open({
                    templateUrl: 'report/metric-tabs-modal.html',
                    size: 'lg',
                    controller: 'metricModalWrapperCtrl'
                });
            }
        };
    }

    angular.module('muceApp.report', ['muceApp.report.resModal', 'muceApp.report.management'])
        .controller('reportBaseCtrl', reportBaseCtrl)
        .controller('sidebarCtrl', sidebarCtrl)
        .controller('addModalCtrl', addModalCtrl)
        .controller('delPanelCtrl', delPanelCtrl)
        .controller('settingCtrl', settingCtrl)
        .controller('detailCtrl', detailCtrl)
        .controller('tableCtrl', tableCtrl)
        .config(function($stateProvider, $urlRouterProvider) {
            _.each(routeInfo, function(opt, name) {
                $stateProvider.state(name, opt);
            });
            $urlRouterProvider
                .when('/management', '/management/report')
        }).run(function($rootScope) {
            $rootScope.$on('$stateChangeStart',
                function(event, toState, toParams, fromState, fromParams) {
                    // event.preventDefault();
                    console.log(toState);
                    console.log(toParams);
                    // transitionTo() promise will be rejected with
                    // a 'transition prevented' error
                });
        });
});