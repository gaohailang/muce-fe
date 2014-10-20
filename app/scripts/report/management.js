define([], function() {
    function pluralize(name) {
        return name.replace(/y$/, 'ie').replace(/$/, 's');
    }

    function managementBaseCtrl($scope, apiHelper) {
        $scope.$root.appTitle = 'Management';
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

                // @ngInject
                function sqlModalCtrl($scope, $timeout) {
                    $scope.infoStr = 'Click To Copy';
                    $scope.copySqlCallback = function() {
                        $scope.infoStr = 'Copied!'
                        $timeout(function() {
                            $scope.infoStr = 'Click To Copy';
                        }, 2000);
                    };
                }

                // @ngInject
                function relationModalCtrl($scope, apiHelper) {
                    $scope.state = {};
                    apiHelper('getGroupList').then(function(data) {
                        $scope.groupList = data;
                        $scope.state.group = data[0];
                    });

                    $scope.$watch('state.group', function(val) {
                        if (!val) return;
                        apiHelper('getCategoryList', {
                            params: {
                                groupId: val.id
                            }
                        }).then(function(data) {
                            $scope.categoryList = data;
                            $scope.state.category = data[0];
                        });
                    }, true);

                    $scope.addRelation = function() {
                        console.log($scope.state);
                        apiHelper('addCategoryReportRelation', {
                            data: {
                                reportId: $scope.report.id,
                                categoryId: $scope.state.category.id
                            }
                        }).then(function() {
                            _initFetchData();
                            $scope.$close();
                        });
                        // check group/category
                        // submit data then refresh report -list
                    };
                }

                $scope.genMetricCardHtml = function(metric) {
                    var rowsHtml = _.map(['name', 'conditions', 'target'], function(t) {
                        return '<tr><td>' + t + '</td><td>' + metric[t] + '</td></tr>';
                    }).join('');
                    return '<table>##</table>'.replace('##', rowsHtml);
                };

                $scope.invokeSQLModal = function(report) {
                    // get report.sql. invoke $modal
                    var newScope = $scope.$new(true);
                    newScope.report = report;

                    $modal.open({
                        templateUrl: 'templates/management/partials/report-sql-modal.html',
                        scope: newScope,
                        size: 'lg',
                        controller: sqlModalCtrl
                    });
                };

                $scope.invokeRelationModal = function(report) {
                    var newScope = $scope.$new();
                    newScope.report = report;
                    $modal.open({
                        templateUrl: 'templates/management/report-relation.html',
                        size: 'lg',
                        scope: newScope,
                        controller: relationModalCtrl
                    });
                };

                $scope.delReportRelation = function(relStr, report) {
                    // build confirm string
                    // Todo: bugize - name with . in it~~
                    // Todo: group/category with id,name
                    var category = _.find(report.categories, function(i) {
                        return i.name === relStr.split('.')[1];
                    });
                    if (!window.confirm(Config.delAlertPrefix + 'report ' + report.name + ' relationship with category ' + category.name)) return;
                    apiHelper('delCategoryReportRelation', {
                        params: {
                            categoryId: category.id,
                            reportId: report.id
                        }
                    }).then(function(data) {
                        // remove from report groupCategories
                        report.groupCategories.splice(report.groupCategories.indexOf(relStr), 1);
                    });
                };

                $scope.delReport = function(item) {
                    if (!window.confirm(Config.delAlertPrefix + 'report ' + item.name)) return;
                    apiHelper('delReport', item.id).then(function(data) {
                        // remove from list
                        // _state.reportList = _.without(_state.reportList, item);
                        _initFetchData();
                    });
                };

                $scope.IntroOptions = {
                    steps: [{
                        element: '#intro-management-search_type',
                        intro: '切换不同类型，来搜索 Report，如 metric, category 等'
                    }, {
                        element: '#intro-management-show_disable_report',
                        intro: '点击后查看被 Disable 掉的报表'
                    }]
                };
                // {
                //     element: '#group-categories-0',
                //     intro: 'Tip: 一个报表可以从属于多个Categories 下，方便查看~'
                // }

                // search report by category/metric etc
                // hide disable report etc
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