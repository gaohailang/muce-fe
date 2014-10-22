define(['report/highchart'], function(highchart) {
    // @ngInject
    function detailCtrl($scope, $state, apiHelper, $timeout, $filter, $rootScope) {
        var _state = $rootScope.state,
            _annotations;
        _state.isAjaxFetching = false;
        console.log('detailCtrl');

        /* Annotation Related */
        $(".chart-wrapper").on('editAnotation', function(e, d) {
            var annotation,
                point = d.point;
            var rawAnnotationInfo = {
                metric: point.series.name,
                mode: 'add',
                style: {
                    left: d.offsetX,
                    top: d.offsetY
                }
            };
            if (point.annotationInfo) {
                annotation = point.annotationInfo;
                rawAnnotationInfo.mode = 'edit';
            } else {
                annotation = {
                    xAxis: $filter('date')(point.x, 'yyyyMMdd'),
                    metricId: findMetricByName(point.series.name).id,
                    period: 0,
                    name: ''
                };
            }
            $scope.$apply(function() {
                $scope.annotation = annotation;
                $scope.rawAnnotationInfo = rawAnnotationInfo;
            });
        });

        $scope.dismissAnnotationPopover = function() {
            $scope.annotation = null;
            $scope.rawAnnotationInfo = null;
        };

        $scope.editAnnotation = function(annotation) {
            if ($scope.rawAnnotationInfo.mode === 'edit') {
                apiHelper('editAnnotation', {
                    data: annotation
                }).then(function() {
                    $scope.dismissAnnotationPopover();
                });
            } else {
                apiHelper('addAnnotation', {
                    data: $scope.annotation
                }).then(function(data) {
                    // 加入到当前的 chart anootation 中
                    console.log(data);
                    _state._allChartData.annotations.push(data);
                    $scope.dismissAnnotationPopover();
                });
            }
        };

        $scope.delAnnotation = function(annotation) {
            var _annotations = _state._allChartData.annotations;
            apiHelper('delAnnotation', annotation.id).then();
            _annotations.splice(_annotations.indexOf(annotation), 1);
            $scope.dismissAnnotationPopover();
        };

        // watch annotation scope, emit jQuery event
        $rootScope.$watchCollection('state._allChartData.annotations', function(data) {
            console.log(arguments[0]);
            if (!data) return;
            $(".chart-wrapper").trigger('updateAnnotations');
            // Todo: fine grain to update annotations
            // http://jsfiddle.net/gh/get/jquery/1.7.2/highslide-software/highcharts.com/tree/master/samples/highcharts/plotoptions/series-point-events-remove/
            // http://api.highcharts.com/highcharts#Point
            highchart.buildLineChart(_state.reportDetail, _state._allChartData);
        });
        /* End */

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
            if (window._lastReportDataTime) {
                if ((new Date().getTime() - window._lastReportDataTime) < 1000) return;
            }
            window._lastReportDataTime = new Date().getTime();
            _state.isAjaxFetching = true;
            console.log('getReport~~');
            apiHelper('getReport', $rootScope.state.report.id, {
                busy: 'global',
                params: _.extend(defaultParams, _.pick($state.params, 'period', 'startDate', 'endDate'))
            }).then(function(data) {
                $rootScope.state._allChartData = data;
                _annotations = data.annotations || [];
                highchart.buildLineChart($rootScope.state.reportDetail, data);
                // special handler for transposition fetch and process
                if (_state.reportDetail.transMetrics) {
                    $timeout(function() {
                        apiHelper('getReport', $rootScope.state.report.id, {
                            busy: 'global',
                            params: _.extend(defaultParams, _.pick($state.params, 'period', 'startDate', 'endDate'), {
                                trans: true
                            })
                        }).then(function(data) {
                            triggerFetchDone(data);
                        });
                    }, 500);
                } else if ($state.params.dimensions && ($state.params.dimensions != '[]')) {
                    // timeout to non-block ui
                    $timeout(function() {
                        apiHelper('getReport', $rootScope.state.report.id, {
                            busy: 'global',
                            params: _.extend(defaultParams, _.pick($state.params, 'period', 'startDate', 'endDate', 'filters', 'dimensions'))
                        }).then(function(data) {
                            triggerFetchDone(data);
                        });
                    }, 500);
                } else {
                    triggerFetchDone(data);
                }
            }, function() {});
        }
        var innerFetching = _.throttle(_innerFetching, 1000);
        $rootScope.$on('report:fetchReportData', innerFetching);
        $scope.$on('base:sidebar-collapsed', function(e, collapsed) {
            var _state = $rootScope.state;
            $timeout(function() {
                // fix period undefined
                highchart.buildLineChart(_state.reportDetail, _state._allChartData);
            }, 300);
        });

        function findMetricByName(name) {
            return _.find(_state.reportDetail.metrics, function(item) {
                return item.name === name;
            });
        }
    }

    return detailCtrl;
});