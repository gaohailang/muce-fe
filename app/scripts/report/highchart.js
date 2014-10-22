define([
    'base/helper'
], function(helper) {
    // Fuck. date format(humanable, or timestamp etc)
    $(".chart-wrapper").on('updateAnnotations', function() {

    });
    var buildLineChart = function(currentReport, data) {
        $('#highcharts_wrapper').html('Report No Data');
        var uniqCate = _.uniq(_.pluck(currentReport.metrics, 'type'));
        var isMutipleY = currentReport.metrics.length > 1 && uniqCate.length > 1;
        var periodMap = {
            0: 'day',
            1: 'hour'
        };
        data.period = periodMap[data.period];

        function formatTip() {

            function buildAnnotation(point) {
                var annotation = '<br/>';
                _.each(data.annotations, function(item) {
                    var metric = _.find(currentReport.metrics, function(m) {
                        return m.id == item.metricId;
                    });
                    if (metric) {
                        var date = helper.getUTCDateByDateAndPeriod(item.xAxis + '');
                        if (point.series.name === metric.name && point.x === date) {
                            annotation += '<p style="color: ' + point.series.color + '">' + item.owner + ': ' + item.name;
                            // '<br/>Create Time: ' + Highcharts.dateFormat('%A %Y-%m-%e', item.createTime)
                        }
                    }
                });
                return annotation;
            }

            var periodFormatMap = {
                hour: '%A %Y-%m-%e:%H',
                day: '%A %Y-%m-%e',
                week: '%A %Y-%m-%e',
                month: '%Y-%m'
            };

            var s = '<b>' + Highcharts.dateFormat(periodFormatMap[data.period], this.x) + '</b>';
            $.each(this.points, function(i, point) {
                s += '<br/><p style="color: ' + point.series.color + '">' + point.series.name + ': ' +
                    point.y;

                s += buildAnnotation(point) + '</p>';
            });

            return s;
        }

        function getSeries() {
            var retData = []
            if (data.result && data.result.length) {
                var annotationPoints = [];
                _.each(currentReport.metrics, function(item, index) {
                    var detailData = {};
                    detailData = {
                        name: item.name,
                        data: [],
                        id: item.id,
                        pointStart: helper.getUTCDateByDateAndPeriod(data.result[0].date, data.period),
                        pointInterval: helper.getIntervalByPeriod(data.period)
                    };
                    // change percent to 2
                    if (isMutipleY && item.type === 2) {
                        detailData.yAxis = 1;
                    }
                    retData.push(detailData);


                    var annotationArray = _.filter(data.annotations, function(ann) {
                        return ann.metricId == item.id;
                    });
                    _.each(annotationArray, function(annotation) {
                        var annotationPoint = {};
                        annotationPoint.metricIndex = index;
                        annotationPoint.index = (helper.getUTCDateByDateAndPeriod(annotation.xAxis, data.period) - detailData.pointStart) / detailData.pointInterval;
                        annotationPoint.id = annotation.id;
                        annotationPoints.push(annotationPoint);
                    });

                });

                _.each(retData, function(item, metricIndex) {
                    var tmp = _.pluck(data.result, item.id);
                    _.each(tmp, function(num, index) {
                        var d = num;
                        var hasAnnotation = _.find(annotationPoints, function(annotation) {
                            return metricIndex === annotation.metricIndex && index === annotation.index;
                        });

                        if (hasAnnotation) {
                            var d = {};
                            d.y = num;
                            d.marker = {
                                symbol: 'url(http://muce.corp.wandoujia.com/images/flag.png?id=' + hasAnnotation.id + ')'
                            };
                        }

                        item.data.push(d);
                    });
                });
            }

            return retData;
        }

        function getYAxis() {
            var yAxisMap = [
                [{
                    title: {
                        text: ''
                    }
                }, {
                    title: {
                        text: ''
                    },
                    opposite: true
                }], {
                    title: {
                        text: ''
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                }
            ];
            return isMutipleY ? yAxisMap[0] : yAxisMap[1];
        }

        function editAnotation(event) {
            var point = event.point;
            if (point.marker) {
                var matchAry = point.marker.symbol.match(/\?id=(\d+)/);
                if (matchAry) {
                    point.annotationInfo = _.find(data.annotations, function(item) {
                        return item.id == matchAry[1];
                    });
                }
            }
            $(".chart-wrapper").trigger("editAnotation", event);
        }

        var chartOptions = {
            chart: {
                renderTo: 'highcharts_wrapper',
                type: 'spline',
                zoomType: 'x',
                marginRight: 50,
                events: {
                    click: function(event) {
                        return;
                        // 清理 annotation click popover
                        $('.annotation-container').alert('close');
                    }
                }
            },
            credits: {
                enabled: false
            },
            title: {
                text: currentReport.name,
                x: -20
            },
            subtitle: {
                text: currentReport.comment,
                x: -20
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: getYAxis(),
            tooltip: {
                formatter: formatTip,
                shared: true,
                crosshairs: true
            },
            plotOptions: {
                series: {
                    cursor: 'pointer',
                    events: {
                        click: editAnotation
                    }
                }
            },
            lang: {
                noData: '没有查询到相关数据'
            },
            noData: {
                style: {
                    fontSize: '18px',
                    color: '#303030'
                }
            },
            series: getSeries()
        };

        return new Highcharts.Chart(chartOptions);
    };

    return {
        buildLineChart: buildLineChart
    };
});