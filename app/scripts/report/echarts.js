define([], function() {

    function getLegend(detail) {
        // get dimension name
        return _.pluck(detail.dimensions, 'name');
    }

    function getXAxisData(data) {
        // or format it
        return _.pluck(data.result, 'date');
    }

    function getSeriesDataById(id, data) {
        return _.map(data.result, function(i) {
            return i[id];
        });
    }

    function getSeries(detail, data) {
        return _.map(detail.metrics, function(metric, idx) {
            return {
                name: metric.name,
                id: metric.id,
                type: 'line',
                data: getSeriesDataById(metric.id, data)
            }
        });
    }

    var currentEchart;

    function buildLineChart(detail, data) {
        $('#echarts_wrapper').html('<span>Report No Data</span>');
        currentEchart = echarts.init($('#echarts_wrapper')[0]);

        var option = {
            title: {
                text: detail.name,
                subtext: detail.comment
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: getLegend(detail)
            },
            toolbox: {
                show: true,
                feature: {
                    mark: {
                        show: true
                    },
                    dataView: {
                        show: true,
                        readOnly: false
                    },
                    magicType: {
                        show: true,
                        type: ['line', 'bar']
                    },
                    restore: {
                        show: true
                    },
                    dataZoom: {
                        show: true
                    },
                    saveAsImage: {
                        show: true
                    }
                }
            },
            dataZoom: {
                show: true,
                realtime: true,
                start: 0,
                end: 100
            },
            calculable: true,
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                data: getXAxisData(data)
            }],
            yAxis: [{
                type: 'value',
                scale: true,
                axisLabel: {
                    // formatter: '{value} °C'
                }
            }],
            series: getSeries(detail, data)
        }
        currentEchart.setOption(option);
    }

    return {
        buildLineChart: buildLineChart
    }
});