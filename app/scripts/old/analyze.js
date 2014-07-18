define([
        'base/muceData',
        'base/muceCom'
    ],
    function(MuceData, MuceCom) {
        var selectedProfileId;
        var selectedMetricId;
        var Analyze = function() {
            var inited = 1;

            function updateProfiles(resp) {
                var profileSelect = $('#analytics_container .profile').html('');
                var option;
                _.each(resp, function(item) {
                    option = $('<option/>').text(item.name)
                        .val(item.id);
                    profileSelect.append(option);
                });
                if (selectedProfileId) {
                    profileSelect.val(selectedProfileId);
                }

                var id = profileSelect.val();
                updateMetircsByProfile(id);
                updateDimentionsByProfile(id);
            }

            function updateMetricCallback(metricId) {
                var profileId = $('#analytics .profile').val();
                updateDimentionsByProfileMetric(profileId, metricId);
            }

            function updateMetircsByProfile(profileId) {
                MuceData.getMetricsByProfile(profileId).done(function(resp) {
                    var metricSelect = $('#analytics_container .metric').html('');
                    var option;
                    _.each(resp, function(item) {
                        option = $('<option/>').text(item.name)
                            .val(item.id);
                        metricSelect.append(option);
                    });

                    if (selectedMetricId) {
                        metricSelect.val(selectedMetricId);
                    }

                    MuceCom.buildComboSearch(resp, $('.analytics-report .metric'), updateMetricCallback);
                    MuceCom.buildComboSearch(resp, $('.compare-container .metric'), updateMetricCallback);

                    var metricId = metricSelect.val();
                    updateDimentionsByProfileMetric(profileId, metricId);
                });
            }

            function updateDimentionsByProfileMetric(profileId, metricId) {
                MuceData.getDimensionsByProfile(profileId, metricId).done(function(resp) {
                    var dimensionSelect = $('#analytics .dimension').html('');
                    var option;
                    dimensionSelect.append($('<option/>').text('').val(''));
                    _.each(resp, function(item) {
                        option = $('<option/>').text(item.name).val(item.id);
                        dimensionSelect.append(option);
                    });
                    if (inited) {
                        buildReport();
                        inited = 0;
                    }
                    MuceCom.buildComboSearch(resp, dimensionSelect);
                })
            }

            function updateDimentionsByProfile(profileId, selectContainer) {

                MuceData.getDimensionsByProfile(profileId).done(function(resp) {
                    var container = !! selectContainer ? selectContainer : $('#compare .dimension');
                    var dimensionSelect = container.html('');
                    var option;
                    _.each(resp, function(item) {
                        option = $('<option/>').text(item.name)
                            .val(item.id);
                        dimensionSelect.append(option);
                    });

                    MuceCom.buildComboSearch(resp, dimensionSelect);
                });
            }

            function updateDate(startDate) {
                var getFormatDate = function(timeSpan) {
                    var today = new Date();
                    var todayDate = today.getDate();

                    var retDate = new Date();
                    retDate.setDate(todayDate - timeSpan);

                    var retYear = retDate.getFullYear();
                    var retMonth = retDate.getMonth() + 1;
                    var retDate = retDate.getDate();
                    retMonth = ('' + retMonth).length == 1 ? '0' + retMonth : retMonth;
                    retDate = ('' + retDate).length == 1 ? '0' + retDate : retDate;

                    return retYear + '-' + retMonth + '-' + retDate;
                }

                $('.start-date').val(getFormatDate(8));
                $('.end-date').val(getFormatDate(1));
            }

            function formateDate(date) {
                return date.replace(/-/g, '') + '0000';
            }

            function buildTableReport(resp, type) {
                switch (type) {
                    case 'summary':

                        if (resp.diff > 0) {
                            resp.className = 'increase-diff';
                        } else {
                            resp.className = 'decrease-diff';
                        }
                        resp.diffRate = (resp.diffRate * 100).toFixed(2) + '%';

                        resp.startDate = MuceCom.formatDate(resp.startDate);
                        resp.endDate = MuceCom.formatDate(resp.endDate);

                        var modal = _.template($('#summary_modal').html(), resp);
                        $('#tabTable').append(modal);

                        break;
                    case 'detail':

                        var tableClass = ['increase', 'decrease'];
                        _.each(tableClass, function(item) {
                            var data;
                            if (item === 'increase') {
                                data = resp.increaseDiffModels;
                            } else if (item === 'decrease') {
                                data = resp.decreaseDiffModels;
                            }

                            resp.tableClass = item;

                            var modal = _.template($('#detail_modal').html(), resp);
                            $('#tabTable').append(modal);

                            var row;
                            _.each(data, function(d) {
                                d.diffRate = (d.diffRate * 100).toFixed(2) + '%';
                                row = _.template($('#row_detail_modal').html(), d);
                                $('.' + item + ' tbody').append(row);
                            });
                        });

                        break;
                }

            }

            function drawColumnChart(data) {
                var chart = new Highcharts.Chart({
                    chart: {
                        renderTo: data.container,
                        type: 'column'
                    },
                    credits: {
                        enabled: false
                    },
                    title: {
                        text: data.title
                    },
                    xAxis: {
                        categories: data.categories
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: ''
                        }
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'top',
                        x: -10,
                        y: 100,
                        borderWidth: 0,
                        floating: true,
                        shadow: true
                    },
                    tooltip: {
                        formatter: function() {
                            return '' +
                                this.x + ': ' + this.y;
                        }
                    },
                    plotOptions: {
                        column: {
                            pointPadding: 0.2,
                            borderWidth: 0
                        }
                    },
                    series: data.series
                });
            }

            function buildColumnReport(resp, type) {
                var container = $('#tabColumn');

                var data = {};
                switch (type) {
                    case 'summary':
                        $('<div/>').attr('id', 'summary_container')
                            .css('width', '100%')
                            .appendTo(container);

                        data.container = 'summary_container'
                        data.categories = [resp.metricName];
                        data.title = resp.profileName;
                        data.series = [{
                            name: resp.startDate,
                            data: [resp.early]
                        }, {
                            name: resp.endDate,
                            data: [resp.latest]
                        }];
                        drawColumnChart(data);
                        break;

                    case 'detail':
                        _.each([resp.increaseDiffModels, resp.decreaseDiffModels], function(item, index) {
                            var id = 'detail_container_' + index;
                            $('<div/>').attr('id', id)
                                .css('width', '100%')
                                .appendTo(container);

                            data.container = id;
                            var dimenType = _.pluck(item, 'dimensionName');
                            var dimenVal = _.pluck(item, 'dimensionValue');
                            data.categories = _.map(_.zip(dimenType, dimenVal), function(item) {
                                return item.join(' / ');
                            });
                            var keyword = index == 0 ? 'increase' : 'decrease';
                            data.title = 'Top 5 ' + keyword + ' dimensions for ' + resp.metricName;
                            data.series = [{
                                name: resp.startDate,
                                data: _.pluck(item, 'early')
                            }, {
                                name: resp.endDate,
                                data: _.pluck(item, 'latest')
                            }];
                            drawColumnChart(data);
                        });
                        break;
                }
            }

            function buildReport() {
                $('#tabTable').html('');
                var dimension = $('#analytics .dimension').val();
                var data = {
                    report_period: 'day',
                    start_date: formateDate($('#analytics .start-date').val()),
                    end_date: formateDate($('#analytics .end-date').val()),
                }
                if (dimension != '') {
                    data.dimension = dimension;
                }
                var id = $('#analytics .metric').val();
                MuceData.getCompareSummary(id, data).done(function(resp) {
                    var type = 'summary';
                    buildTableReport(resp, type);
                    buildColumnReport(resp, type);
                });

                MuceData.getCompareDetail(id, data).done(function(resp) {
                    resp.startDate = MuceCom.formatDate(resp.startDate);
                    resp.endDate = MuceCom.formatDate(resp.endDate);

                    var type = 'detail';
                    buildTableReport(resp, type);
                    buildColumnReport(resp, type);
                });
            }

            MuceData.getProfiles().done(function(resp) {
                updateProfiles(resp);
            });

            $('#analytics_container .profile').on('change', function() {
                var id = $(this).val();
                updateMetircsByProfile(id);
                updateDimentionsByProfile(id);
            });

            updateDate();

            $('#analytics .apply').on('click', function() {
                buildReport();
            });

            $('#analytics .operation-container input:not(.search-title)').keydown(function(event) {
                if (event.keyCode == 13) {
                    buildReport();
                }
            });


            function drawChart(arrayData) {
                var currentMetric = $('#compare .metric')[0];
                var metricName = currentMetric.options[currentMetric.selectedIndex].text;

                var getSeries = function() {
                    var retData = [];

                    _.each(arrayData, function(item, index) {
                        var nameArray = [];


                        _.each(item.filters, function(filter, i) {
                            var currentDimen = $('#compare .dimension')[i];
                            var dimenName = currentDimen.options[currentDimen.selectedIndex].text;

                            nameArray.push(dimenName + ' ' + filter.operator + ' ' + filter.value);
                        });

                        var filter = item.filters[0];
                        var detailData = {};
                        detailData = {
                            name: nameArray.join('   &   '),
                            data: [],
                            id: '',
                            pointStart: MuceCom.getUTCDateByDateAndPeriod(item.result[0].date, item.period),
                            pointInterval: item.period === 'day' ? 24 * 3600 * 1000 : 3600 * 1000
                        };

                        var metricId = item.metrics[0];
                        _.each(item.result, function(m) {
                            detailData.data.push(m[metricId] * 1);
                        });

                        retData.push(detailData);
                    });

                    return retData;
                }

                var getCategories = function() {
                    var retCat = [];
                    var maxData = _.max(arrayData, function(d) {
                        return d.result.length;
                    });

                    var dates = _.pluck(maxData.result, 'date');
                    retCat = _.map(dates, function(item) {
                        return MuceCom.formatDate(item);
                    });

                    return retCat;
                }

                var chart = new Highcharts.Chart({
                    chart: {
                        renderTo: 'chart_container',
                        type: 'line',
                        marginRight: 130,
                        marginBottom: 25
                    },
                    credits: {
                        enabled: false
                    },
                    title: {
                        text: 'Compare 「' + metricName + '」',
                        x: -20 //center
                    },
                    subtitle: {
                        text: '',
                        x: -20
                    },
                    xAxis: {
                        type: 'datetime'
                    },
                    yAxis: {
                        title: {
                            text: ''
                        },
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: '#808080'
                        }]
                    },
                    tooltip: {
                        formatter: function() {
                            return '<b>' + this.series.name + '</b><br/>' +
                                Highcharts.dateFormat('%A %Y-%m-%e', this.x) + ': ' + this.y;
                        }
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'top',
                        verticalAlign: 'top',
                        x: -10,
                        y: 30,
                        borderWidth: 0
                    },
                    series: getSeries()
                });

            }

            function drawTable(data) {
                var resultData = [];
                _.each(data, function(item) {
                    resultData = resultData.concat(item.result);
                });
                var sortedData = _.sortBy(resultData, function(item) {
                    return item.date;
                });
                $('.compare-container .compare-table').remove();

                var metric = $('.compare-container .analytics-metric-container .metric');
                var metricId = metric.val();
                var dimension = $('.compare-container .dimension');
                var obj = {};
                var dimensionsData = [];
                _.each(dimension, function(item) {
                    obj.id = $(item).val();
                    obj.name = $(item)[0].options[$(item)[0].selectedIndex].text;
                    dimensionsData.push(obj);
                });

                var data = {};
                data.result = sortedData;
                data.metricsData = [{
                    id: metricId,
                    name: metric[0].options[metric[0].selectedIndex].text
                }];
                data.dimensionsData = dimensionsData;
                var table = MuceCom.drawTable(data, {
                    className: 'compare-table'
                });

                $('.compare-container').append(table);
            }

            function getCompareData() {
                var profileId = $('#compare .profile').val();
                var metricId = $('#compare .metric').val();
                var dimenId = $('#compare .dimension').val();
                var startDate = formateDate($('#compare .start-date').val());
                var endDate = formateDate($('#compare .end-date').val());

                var arrayData = [];
                _.each([$('.dimen-val-container .dimen-val-1'), $('.dimen-val-container .dimen-val-2')], function(list, index) {
                    $(list).removeClass('warning');

                    var dimensionIds = [];
                    var filters = [];
                    _.each(list, function(item) {
                        var dimen = $(item);
                        var val = dimen.val();

                        if ( !! val.length) {
                            var filter = {};
                            var id = $('.dimension', dimen.parents('.compare-filter-container')).val()
                            filter.key = 'd' + id;
                            filter.operator = $('.operator', dimen.parent()).val();
                            filter.value = val;
                            filters.push(filter);

                            dimensionIds.push(id);
                        }
                    });

                    var data = {
                        metrics: metricId,
                        dimensions: dimensionIds.join(','),
                        period: 'day',
                        start_date: startDate,
                        end_date: endDate,
                        filters: JSON.stringify(filters)
                    };

                    MuceData.getReportsData(profileId, data).done(function(resp) {
                        if (resp.result.length) {
                            arrayData.push(resp);

                            drawChart(arrayData);
                            if (index == 1) {
                                drawTable(arrayData);
                            }
                        } else {
                            $(list).addClass('warning');
                        }

                    });
                });
            }

            $('#compare .apply').on('click', function() {
                getCompareData();
            });

            $('#compare .operation-container').delegate('input:not(.search-title)', 'keydown', function(event) {
                $(this).removeClass('warning');
                if (event.keyCode == 13) {
                    getCompareData();
                }
            });

            function buildFilter(index) {
                var filter = _.template($('#compare_filter').html());

                $('.dimen-val-container .apply').before(filter);
            }

            $('#compare .add-filter').on('click', function() {
                buildFilter($('.compare-filter-container').length + 1);

                var profileId = $('.compare-container .profile').val();
                var selectContainer = $('.compare-filter-container').last();

                updateDimentionsByProfile(profileId, $('.dimension', selectContainer));
            });

            $('#compare').delegate('.delete-filter', 'click', function() {
                if ($('.compare-filter-container').length == 1) {
                    alert('都剩最后一个了，你还删删删!');
                } else {
                    var filter = $(this).parents('.compare-filter-container');
                    filter.remove();
                }
            })

            buildFilter(0);

            $('.save-search').on('click', function() {
                $('.compare-container .search-title').show()
                    .focus();
                $(this).hide();
            });

            $('.compare-container .search-title').keydown(function(e) {
                var target = $(this).removeClass('warning');
                if (event.keyCode == 13) {
                    var title = target.val();
                    if (!title.length) {
                        target.addClass('warning');
                        return;
                    } else {
                        var data = {};
                        data.title = title;
                        data.profile = $('.compare-container .profile').val();
                        data.metric = $('.compare-container .metric').val();
                        data.filters = [];
                        _.each($('.compare-container .compare-filter-container'), function(item) {
                            var temp = {};
                            temp.dimension = $('.dimension', $(item)).val();
                            temp.vals = [$('.dimen-val-1', $(item)).val(), $('.dimen-val-2', $(item)).val()];

                            data.filters.push(temp);
                        });

                        var list = localStorage.getItem('Muce-Analytics-Search-List');
                        if ( !! list) {
                            list = JSON.parse(list);
                            var searchItem = _.find(list, function(item) {
                                return item.title == data.title;
                            });
                            if (searchItem) {
                                target.addClass('warning');
                                target.val(data.title + ' //重名了');
                            } else {
                                list.push(data);
                                localStorage.setItem('Muce-Analytics-Search-List', JSON.stringify(list));
                                target.hide();

                                $('.save-search').text('Success').show('fast');
                                setTimeout(function() {
                                    $('.save-search').text('保存搜索条件');
                                }, 1000);
                                refreshSearchList();
                            }
                        } else {
                            var list = [];
                            list.push(data);
                            localStorage.setItem('Muce-Analytics-Search-List', JSON.stringify(list));

                            target.hide();
                            $('.save-search').text('Success').show('fast');
                            setTimeout(function() {
                                $('.save-search').text('保存搜索条件');
                            }, 1000);
                            refreshSearchList();
                        }


                    }
                }
            }).on('blur', function() {
                $('.save-search').show();
                $(this).hide();
            });

            var refreshSearchList = function() {
                $('.search-list').html('');
                var list = localStorage.getItem('Muce-Analytics-Search-List');
                list = JSON.parse(list);
                _.each(list, function(item) {
                    if ( !! item.title) {
                        var deleteSearchItem = $('<i/>').addClass('icon-trash delete-search-item');
                        var link = $('<a/>').append(item.title);
                        var li = $('<li/>').append(link)
                            .append(deleteSearchItem)

                        $('.search-list').append(li);
                    }
                });

                $('.search-list li').delegate('.delete-search-item', 'click', function() {
                    var list = localStorage.getItem('Muce-Analytics-Search-List');
                    list = JSON.parse(list);

                    var title = $('a', $(this).parent()).text();
                    var searchItem = _.find(list, function(item, index) {
                        item.index = index;
                        return item.title == title;
                    });
                    list.splice(searchItem.index, 1);

                    localStorage.setItem('Muce-Analytics-Search-List', JSON.stringify(list));
                    refreshSearchList();
                });

                $('.search-list a').on('click', function() {
                    var list = localStorage.getItem('Muce-Analytics-Search-List');
                    list = JSON.parse(list);
                    var title = $(this).text();
                    var searchItem = _.find(list, function(item) {
                        return item.title == title;
                    });

                    $('.compare-container .profile').val(searchItem.profile)
                        .trigger('change');
                    $('.compare-container .metric').val(searchItem.metric)
                        .trigger('change');
                    var filterContainers = $('.compare-container .compare-filter-container');
                    _.each(filterContainers, function(item, index) {
                        if (index >= searchItem.filters.length) {
                            $(item).remove();
                        }
                    });
                    _.each(searchItem.filters, function(item, index) {
                        var container = filterContainers[index];
                        if (!container) {
                            $('.compare-container .add-filter').trigger('click');
                        }

                        setTimeout(function() {
                            container = $('.compare-container .compare-filter-container')[index];
                            $('.dimension', container).val(item.dimension)
                                .trigger('change');
                            _.each(item.vals, function(val, i) {
                                $('.dimen-val', container)[i].value = val;
                            });

                        }, 500);

                    });

                });
            }

            refreshSearchList();

            return {
                updateSelectedProfile: function(profile, metric) {
                    $('#analytics_container .profile').val(profile);
                    $('#analytics_container .metric').val(metric);
                }
            }
        }

        var analyze;
        var factory = _.extend(function() {}, {
            getInstance: function() {
                if (!analyze) {
                    analyze = new Analyze();
                }

                return analyze;
            }
        });
        return factory;
    });