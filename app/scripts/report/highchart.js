define(function() {
    function addAnotation(event) {
        $('.annotation-container').remove();
        var annotationId;
        if (event.point.marker) {
            var symbol = event.point.marker.symbol;
            var matchAry = symbol.match(/\?id=(\d+)/);
            if (matchAry) {
                annotationId = matchAry[1];
            }
        }

        var container = $('<div/>').addClass('annotation-container alert fade in')
            .css({
                left: event.point.pageX,
                top: event.point.pageY
            });
        var heading = $('<h4/>').addClass('alert-heading')
            .append(this.name);
        var closeBtn = $('<button/>').addClass('close')
            .attr('data-dismiss', 'alert')
            .append('x');

        var textarea = $('<textarea/>').addClass('textarea');
        var saveBtn = $('<button/>').addClass('save btn')
            .append('Save');
        var deleteBtn = $('<a/>')
            .addClass('delete')
            .append('Delete');

        if (annotationId) {
            var annotationInfo = _.find(data.annotations, function(item) {
                return item.id == annotationId;
            });
            textarea.val(annotationInfo.comment);
            deleteBtn.show();
        } else {
            deleteBtn.hide();
            textarea.val('');
        }

        container.append(closeBtn)
            .append(heading)
            .append(textarea)
            .append(deleteBtn)
            .append(saveBtn);

        $(document.body).append(container);

        saveBtn.on('click', function() {
            var data = {};
            data = {
                metric: _.find(currentData.report.metrics, function(item) {
                    return item.name === this.name;
                }.bind(this)).id,
                x_axis: Highcharts.dateFormat('%Y%m%d%H', event.point.x),
                period: MuceCom.getCurrentPeriod(),
                filters: MuceCom.stringifyObj(currentData.table_filters),
                user: $('.user-name').text(),
                comment: $('.annotation-container .textarea').val(),
                type: 'put'
            };

            if (annotationId) {
                data.id = annotationId;
                data.type = 'post';
            }

            MuceData.addAnnotation(data).done(function() {
                $('.annotation-container').alert('close');
                factory.getInstance().refresh(currentData);
            }.bind(this));
        }.bind(this));

        deleteBtn.on('click', function() {
            MuceData.deleteAnnotation(annotationId).done(function() {
                $('.annotation-container').alert('close');
                factory.getInstance().refresh(currentData);
            });
        });

        $('.annotation-container').alert();
    }

    function formatTip() {
        var annotation = '';
        _.each(data.annotations, function(item) {
            var metric = _.find(currentData.report.metrics, function(m) {
                return m.id == item.metric;
            });
            if (metric) {
                var date = MuceCom.getUTCDateByDateAndPeriod(item.xAxis + '');
                if (this.series.name === metric.name && this.x === date) {
                    annotation = item.user + ': ' + item.comment + '<br/>Create Time: ' + Highcharts.dateFormat('%A %Y-%m-%e', item.createTime);
                }
            }

        }.bind(this));

        var format;
        switch (data.period) {
            case 'hour':
                format = '%A %Y-%m-%e:%H';
                break;
            case 'day':
            case 'week':
                format = '%A %Y-%m-%e';
                break;
            case 'month':
                format = '%Y-%m';
                break;
        }

        var tip = '<b>' + this.series.name + '</b><br/>' +
            Highcharts.dateFormat(format, this.x) + ': ' + this.y + '<br/>' + annotation;

        return tip;
    }

    function getSeries() {
        var retData = []
        if (data.result && data.result.length) {
            var annotationPoints = [];
            _.each(currentData.report.metrics, function(item, index) {
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

                var annotationArray = _.filter(data.annotations, function(ann) {
                    return ann.metric == item.id;
                });
                _.each(annotationArray, function(annotation) {
                    var annotationPoint = {};
                    annotationPoint.metricIndex = index;
                    annotationPoint.index = (MuceCom.getUTCDateByDateAndPeriod(annotation.xAxis, data.period) - detailData.pointStart) / detailData.pointInterval;
                    annotationPoint.id = annotation.id;
                    annotationPoints.push(annotationPoint);
                });
            });

            _.each(retData, function(item, metricIndex) {
                var tmp = _.pluck(data.result, item.id);
                _.each(tmp, function(num, index) {
                    if (!num) {
                        num = 0;
                    }
                    var d = Number(num);

                    var hasAnnotation = _.find(annotationPoints, function(annotation) {
                        return metricIndex === annotation.metricIndex && index === annotation.index;
                    });

                    if (hasAnnotation) {
                        var d = {};
                        d.y = Number(num);
                        d.marker = {
                            symbol: 'url(http://muce.corp.wandoujia.com/images/flag.png?id=' + hasAnnotation.id + ')'
                        };
                    }

                    item.data.push(d);
                })
            });
        }

        return retData;
    }

    function getYAxis() {

        if (isMutipleY) {
            var ret = [{
                title: {
                    text: ''
                }
            }, {
                title: {
                    text: ''
                },
                opposite: true
            }];

        } else {
            var ret = {
                title: {
                    text: ''
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            };
        }

        return ret;
    }

    function getXAxis() {
        var ret = [];
        ret = _.pluck(data.result, 'date');
        ret = _.map(ret, function(item) {
            var arry = item.match(/(\d{4})(\d{2})(\d{2})/);
            return arry[2] + '-' + arry[3];
        });
        return ret;
    }

    var highChartOption = {
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
            formatter: formatTip
        },
        plotOptions: {
            series: {
                cursor: 'pointer',
                events: {
                    click: addAnotation
                }
            }
        },
        series: getSeries()
    };

    return {
        buildLineChart: function() {
            return new Highcharts.Chart(highChartOption);
        }
    };
});