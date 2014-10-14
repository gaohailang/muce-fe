define([], function() {
    function pluralize(name) {
        return name.replace(/y$/, 'ie').replace(/$/, 's');
    }

    function managementBaseCtrl($scope, apiHelper) {
        $scope.toggleResStatus = function(enable, type, data) {
            apiHelper('updateEnable', {
                data: {
                    id: data.id,
                    type: type,
                    enable: enable
                }
            }).then(function() {}, function() {
                // error~ refresh?! or reset switch
            });
        };
    }

    var viewCtrls = _.map(['metric', 'dimension', 'report'], function(type) {
        return ['$scope', 'apiHelper', '$rootScope', '$modal', '$timeout', function($scope, apiHelper, $rootScope, $modal, $timeout) {
            var capitalizeType = _.capitalize(type);
            var _initFetchData = function() {
                apiHelper('getDetail' + capitalizeType + 'sList', {
                    busy: 'global'
                }).then(function(data) {
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
                /*$scope[type + 'List'].push(data); // 格式不一样~~
                $timeout(function() {
                    $(document).scrollTop(100000); // Todo: 滚动到最下面
                });*/
            });
            $rootScope.$on('report:edit' + capitalizeType, function(e, data) {
                _initFetchData();
            });

            if (type === 'report') {
                function handleShowDisable() {
                    if ($scope.showDisable) {
                        delete $scope.filterObj.enable;
                    } else {
                        $scope.filterObj.enable = true;
                    }
                }
                $scope.genMetricCardHtml = function(metric) {
                    var rowsHtml = _.map(['name', 'conditions', 'target'], function(t) {
                        return '<tr><td>' + t + '</td><td>' + metric[t] + '</td></tr>';
                    }).join('');
                    return '<table>##</table>'.replace('##', rowsHtml);
                };
                $scope.filterOpts = ['report', 'group', 'category', 'metric', 'dimension', 'owner'];
                $scope.filterField = 'report';
                $scope.filterObj = {
                    enable: true
                };
                $scope.showDisable = false;
                $scope.$watch('showDisable', function(val, old) {
                    if (_.isUndefined(old)) return;
                    console.log(val);
                    handleShowDisable($scope.filterObj);
                });

                $scope.$watch(function() {
                    return [$scope.filterText, $scope.filterField]
                }, function() {
                    $scope.filterObj = {};
                    handleShowDisable($scope.filterObj);
                    // TODO: Metric, dimension, category, report : nested array name
                    if ($scope.filterText && $scope.filterField) {
                        if ($scope.filterField === 'report') {
                            $scope.filterObj.name = $scope.filterText;
                        } else if ($scope.filterField === 'owner') {
                            $scope.filterObj[$scope.filterField] = $scope.filterText;
                        } else {
                            $scope.filterObj = function(report) {
                                // Todo hide enable
                                var _s, passed = false;
                                _.each(report[pluralize($scope.filterField)], function(i) {
                                    _s = i.name ? i.name : i;
                                    if (_s.match(new RegExp($scope.filterText))) {
                                        passed = true;
                                    }
                                });
                                // 当不展示 disable 的，过滤掉 !enable 的
                                if (!$scope.showDisable && !report.enable) {
                                    return false;
                                }
                                return passed;
                            };
                        }
                    }
                }, true);
            }
        }]
    });

    angular.module('muceApp.report.management', [])
        .controller('managementBaseCtrl', managementBaseCtrl)
        .controller('viewMetricsCtrl', viewCtrls[0])
        .controller('viewDimensionsCtrl', viewCtrls[1])
        .controller('viewReportsCtrl', viewCtrls[2]);
});