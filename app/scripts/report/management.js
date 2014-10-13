define([], function() {

    function managementBaseCtrl($scope, apiHelper) {
        $scope.toggleResStatus = function() {
            console.log(arguments);
            // if error, change status?! - broken because of one-way pass value~~
        };
    }

    var viewCtrls = _.map(['metric', 'dimension', 'report'], function(type) {
        return ['$scope', 'apiHelper', '$rootScope', '$modal', '$timeout', function($scope, apiHelper, $rootScope, $modal, $timeout) {
            var capitalizeType = _.capitalize(type);
            var _initFetchData = function() {
                apiHelper('getDetail' + capitalizeType + 'sList').then(function(data) {
                    $scope[type + 'List'] = data;
                });
            };
            _initFetchData();


            $scope['del' + capitalizeType] = function(item) {
                apiHelper('del' + capitalizeType, item.id).then(function() {
                    var alertTip = Config.delAlertPrefix + type + ' ' + item.name;
                    if (!window.confirm(alertTip)) return;
                    // remove metric from list
                    $scope[type + 'List'] = _.without($scope[type + 'List'], item);
                });
            };

            $scope['edit' + capitalizeType] = function(item) {
                var newScope = $scope.$new(true);
                $scope._data = _.clone(item);

                var templateUrl;
                if (!$scope.delMetric) {
                    templateUrl = 'templates/report/modal.html';
                    $modal.open({
                        templateUrl: templateUrl,
                        controller: type + 'ModalCtrl',
                        scope: $scope,
                        size: 'lg'
                    });
                } else {
                    templateUrl = 'report/metric-tabs-modal.html';
                    $modal.open({
                        templateUrl: templateUrl,
                        controller: 'metricModalWrapperCtrl',
                        scope: $scope,
                        size: 'lg'
                    });
                }
            };

            // when a res is added, inject it to list view model
            $rootScope.$on('report:add' + capitalizeType, function(e, data) {
                _initFetchData();
                return;
                $scope[type + 'List'].push(data);
                // Todo: 滚动到最下面
                $timeout(function() {
                    $(document).scrollTop(100000);
                });
            });
            $rootScope.$on('report:edit' + capitalizeType, function(e, data) {
                _initFetchData();
            });

            if (type === 'report') {
                $scope.genMetricCardHtml = function(metric) {
                    var rowsHtml = _.map(['name', 'conditions', 'target'], function(t) {
                        return '<tr><td>' + t + '</td><td>' + metric[t] + '</td></tr>';
                    }).join('');
                    return '<table>##</table>'.replace('##', rowsHtml);
                };
            }
        }]
    });

    angular.module('muceApp.report.management', [])
        .controller('managementBaseCtrl', managementBaseCtrl)
        .controller('viewMetricsCtrl', viewCtrls[0])
        .controller('viewDimensionsCtrl', viewCtrls[1])
        .controller('viewReportsCtrl', viewCtrls[2]);
});