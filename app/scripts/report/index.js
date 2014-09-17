define([
    'report/reportCtrl',
    'report/sidebarCtrl',
    'report/settingCtrl',
    'report/tableCtrl',
    'report/chart',
    'report/highchart',
    'report/add'
], function(reportCtrl, sidebarCtrl, settingCtrl, tableCtrl, chartPanelCtrl, highchart) {

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

    _.template("Hello <%= name %>!", {
        name: "Mustache"
    })

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
        }
    };

    function detailCtrl($scope, $state, apiHelper, $timeout, $filter, $rootScope) {
        var _state = $rootScope.state;
        $rootScope.$on('report:fetchReportData', function() {
            var defaultParams = {
                filters: [],
                cache: 1,
                dimensions: []
            };
            apiHelper('getReport', _state.report.id, {
                busy: 'global',
                params: _.extend(defaultParams, _.pick($state.params, 'period', 'startDate', 'endDate'))
            }).then(function(data) {
                highchart.buildLineChart(_state.reportDetail, data);
                $rootScope.$emit('report:renderReportData', [_state.reportDetail, data]);
                // buildGridData(_state.reportDetail, data);
                isFetchReport = false;
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

    /* delete widget */
    function delPanelCtrl(apiHelper, $scope, $timeout) {
        // scope: currentDelType, selectedItems, currentDelList, currentQuery
        $scope.delTypes = ['group', 'category', 'metric', 'dimension'];
        $scope.currentDelType = $scope.delTypes[0];

        $scope.$watch('currentDelType', function(val) {
            if (!val) return;
            resetType();
            apiHelper('get' + _.capitalize(val) + 'List').then(function(data) {
                $scope.currentDelList = data;
            });
        });

        function resetType() {
            $scope.currentQuery = '';
            $scope.currentDelList = [];
            // loading
        }

        $scope.delSelectedHandler = function() {
            var selectedItems = _.filter($scope.currentDelList, function(i) {
                return i.selected
            });
            var selected = _.pluck(selectedItems, 'name');
            if (!selected.length) return;

            function buildAlertStr() {
                var suffix;
                if (selected.length > 1) {
                    suffix = 'those ' + $scope.currentDelType + 's';
                } else {
                    suffix = 'this ' + $scope.currentDelType;
                }
                return Config.delAlertPrefix + suffix + ' :『' + selected.join(', ') + '』';
            }
            if (!window.confirm(buildAlertStr())) return;
            // use selectedItems to ids
            _.each(selectedItems, function(item) {
                apiHelper('del' + _.capitalize($scope.currentDelType), item.id).then(function(data) {
                    // remove from list
                    $scope.currentDelList = _.without($scope.currentDelList, item);
                    // remove from $rootScope.reportList, $rootScope.categoryList, $rootScope.groupList
                    if (_.contains(['group', 'category', 'report'], $scope.currentDelType)) {
                        $rootScope[$scope.currentDelType + 'List'] = _.without($rootScope[$scope.currentDelType + 'List'], item);
                    }
                });
            });
        };
    }

    angular.module('muceApp.report', ['muceApp.report.add'])
        .controller('reportCtrl', reportCtrl)
        .controller('sidebarCtrl', sidebarCtrl)
        .controller('settingCtrl', settingCtrl)
        .controller('tableCtrl', tableCtrl)
        .controller('detailCtrl', detailCtrl)
        .controller('addModalCtrl', addModalCtrl)
        .controller('delPanelCtrl', delPanelCtrl)
        .controller('chartPanelCtrl', chartPanelCtrl)
        .config(function($stateProvider) {
            _.each(routeInfo, function(opt, name) {
                $stateProvider.state(name, opt);
            });
        });
});