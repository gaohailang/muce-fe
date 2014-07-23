define([
    'base/MuceCom'
], function(MuceCom) {

    return {
        buildLineChart: function(currentReport, data) {
            $('#chart_canvas').html('');
            var uniqCate = _.uniq(_.pluck(currentReport.metrics, 'type'));
            var isMutipleY = currentReport.metrics.length > 1 && uniqCate.length > 1;

            function formatTip() {
                var periodFormatMap = {
                    0: '%A %Y-%m-%e:%H', // hour
                    1: '%A %Y-%m-%e', // day
                    week: '%A %Y-%m-%e',
                    month: '%Y-%m'
                };

                var s = '<b>' + Highcharts.dateFormat(periodFormatMap[data.period], this.x) + '</b>';

                // Todo: with template to build str
                $.each(this.points, function(i, point) {
                    s += '<br/><p style="color: ' + point.series.color + '">' + point.series.name + ': ' +
                        point.y + '</p>';
                });

                return s;
            }

            function getSeries() {
                var retData = []
                if (data.result && data.result.length) {
                    _.each(currentReport.metrics, function(item, index) {
                        var detailData = {};
                        detailData = {
                            name: item.name,
                            data: [],
                            id: item.id,
                            pointStart: MuceCom.getUTCDateByDateAndPeriod(data.result[0].date, data.period),
                            pointInterval: MuceCom.getIntervalByPeriod(data.period)
                        };
                        if (isMutipleY && item.type === 'percent') {
                            detailData.yAxis = 1;
                        }
                        retData.push(detailData);

                    });

                    _.each(retData, function(item, metricIndex) {
                        var tmp = _.pluck(data.result, item.id);
                        _.each(tmp, function(num, index) {
                            if (!num) {
                                num = 0;
                            }
                            var d = Number(num);
                            item.data.push(d);
                        })
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

            function getChartOption() {
                return {
                    chart: {
                        renderTo: 'chart_canvas',
                        type: 'line',
                        zoomType: 'x',
                        marginRight: 50,
                        events: {
                            click: function(event) {
                                // 清理 annotation click popover
                                // $('.annotation-container').alert('close');
                            }
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    title: {
                        text: '',
                        x: -20
                    },
                    subtitle: {
                        text: '',
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
                                // click: addAnotation
                            }
                        }
                    },
                    series: getSeries()
                };
            }

            return new Highcharts.Chart(getChartOption());
        }
    };
});