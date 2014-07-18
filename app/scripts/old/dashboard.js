define([
    'base/muceData',
    'base/muceCom'
], function(MuceData, MuceCom) {

    var Dashboard = function() {
        var dashboardContainer = $('#dashboard_container .widgets-container');
        var commonFilter = $('#dashboard_container .common-filter');

        var drawChart = function(data, containerId) {
            var categories = _.pluck(data.metrics, 'type');
            var uniqCate = _.uniq(categories);
            var isMutipleY = data.metrics.length > 1 && uniqCate.length > 1;

            var getSeries = function() {
                var retData = [];

                var annotationPoints = [];
                _.each(data.metrics, function(item, index) {
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
                                symbol: 'url(images/flag.png?id=' + hasAnnotation.id + ')'
                            };
                        }

                        item.data.push(d);
                    })
                });
                return retData;
            }

            var getYAxis = function() {

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

            var chart = new Highcharts.Chart({
                chart: {
                    renderTo: containerId,
                    type: 'line',
                    marginRight: 40
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: '',
                    x: -20 //center
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
                    formatter: function() {
                        var annotation = '';
                        _.each(data.annotations, function(item) {
                            var metric = _.find(data.metrics, function(m) {
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

                        var value = MuceCom.formatNumberByThousandSeparator(this.y);
                        var tip = '<b>' + this.series.name + '</b><br/>' +
                            Highcharts.dateFormat(format, this.x) + ': ' + value + '<br/>' + annotation;

                        return tip;
                    }
                },
                legend: {
                    borderWidth: 0
                },
                series: getSeries()
            });

        }

        var drawTable = function(data, containerId) {
            var container = $('#' + containerId).addClass('widget-table-wrapper')
            table = MuceCom.drawTable(data, {
                className: 'widget-table'
            });
            container.append(table);
        }

        var repaintDashboards = function() {
            var widgets = $('.widget', dashboardContainer);
            widgets.removeClass('fister-column-widget');
            _.each(widgets, function(item, index) {
                if (index % 2 === 0) {
                    $(item).addClass('fister-column-widget');
                }
            });
        }

        var getWidgetsByDashboard = function(id) {
            var date = MuceCom.getDate(commonFilter);
            MuceData.getWidgetsByDashboard(id).done(function(widgetsData) {
                dashboardContainer.html('');
                if (widgetsData && widgetsData.length) {
                    widgetsData = _.sortBy(widgetsData, function(item) {
                        return item.position;
                    });

                    _.each(widgetsData, function(item, index) {
                        var widget = $('<div/>').addClass('widget')
                            .attr('data-id', item.id);
                        widget.addClass('span6');
                        if (index % 2 === 0) {
                            widget.addClass('fister-column-widget')
                        }

                        var title = $('<a/>')
                            .addClass('widget-title well well-small')
                            .html(item.title);

                        var removeWidget = $('<i/>')
                            .addClass('icon-trash remove-widget widget-action');
                        var editWidget = $('<i/>')
                            .addClass('icon-pencil edit-widget widget-action');

                        var chartContainer = $('<div/>')
                            .addClass('widget-chart')
                            .attr('id', 'widget_chart_' + index);
                        var editWidgetTitleInput = $('<input/>').addClass('edit-widget-title')
                            .attr({
                                'rel': 'tooltip',
                                'data-placement': 'bottom',
                                'data-original-title': 'Enter「Return」To Save Title',
                                'value': item.title,
                                'data-id': item.id
                            });
                        var profileData,
                            groupData,
                            reportData;
                        var d1 = MuceData.getProfileById(item.profileId).done(function(resp) {
                            profileData = resp;
                        });
                        var d2 = MuceData.getGroupById(item.groupId).done(function(resp) {
                            groupData = resp;
                        });
                        var d3 = MuceData.getReportById(item.reportId).done(function(resp) {
                            reportData = resp;
                        });

                        $.when(d1, d2, d3).done(function() {
                            var metrics = _.pluck(reportData.metrics, 'id');
                            var linkReport = '#report/' + profileData.name + '/' + groupData.name + '/' + reportData.name + '?';
                            linkReport += window.encodeURIComponent(item.parameters + '&start_date=' + date.originStart + '&end_date=' + date.originEnd);

                            title.attr('href', linkReport);

                            var url = '/muce-webapp/muce/report/' + item.profileId + '?' + (item.parameters.length ? '&' + item.parameters : item.parameters) + '&start_date=' + date.start + '&end_date=' + date.end + '&with_summary=true';

                            $.getJSON(url, function(data) {
                                if (data.result && data.result.length) {
                                    var metricsData = _.filter(reportData.metrics, function(item) {
                                        return _.indexOf(data.metrics, item.id) != -1;
                                    });

                                    var dimensionsData = _.filter(reportData.dimensions, function(item) {
                                        return _.indexOf(data.dimensions, item.id) != -1;
                                    });

                                    var containerId = 'widget_chart_' + index;

                                    switch (item.type) {
                                        case 'pie':
                                            var config = {
                                                'containerId': containerId,
                                                'metricsData': metricsData,
                                                'topNum': item.top,
                                                'currentMetricId': data.metrics[0],
                                                'currentDimensionId': data.dimensions[0]
                                            };

                                            MuceCom.drawPieByDimension(data, config);
                                            break;
                                        case 'area':
                                            var config = {
                                                'containerId': containerId,
                                                'topNum': item.top,
                                                'currentMetricId': data.metrics[0],
                                                'currentDimensionId': data.dimensions[0]
                                            }

                                            MuceCom.drawAreaByDimension(data, config);
                                            break;
                                        case 'table':
                                            data.metricsData = metricsData;
                                            data.dimensionsData = dimensionsData;
                                            drawTable(data, containerId);
                                            break;
                                        default:
                                            data.metrics = metricsData;
                                            data.name = reportData.name;
                                            drawChart(data, containerId);
                                            break;
                                    }


                                } else {
                                    $('#widget_chart_' + index).html('No Data');
                                }
                            });

                        }, this)

                        widget.append(title)
                            .append(editWidget)
                            .append(removeWidget)
                            .append(chartContainer)
                            .append(editWidgetTitleInput);

                        dashboardContainer.append(widget);

                        $("#widgets_container").sortable({
                            helper: "clone",
                            connectWith: "#widgets_container",
                            stop: function() {
                                repaintDashboards();
                                var positionInfo = [];
                                _.each($('.widget', dashboardContainer), function(item, index) {
                                    var w = {};
                                    var id = $(item).attr('data-id') * 1;
                                    var widgetData = _.find(widgetsData, function(i) {
                                        return i.id === id;
                                    });
                                    w.id = id;
                                    w.position = index;

                                    positionInfo.push(w);
                                });
                                var data = {
                                    update_positions: JSON.stringify(positionInfo)
                                }
                                MuceData.updateWidgetsPosition(data).done(function() {
                                    var tip = $('<div/>').addClass('alert alert-success update-position-tip')
                                        .html('Sort Widgets Success');

                                    $(document.body).append(tip);
                                    tip.show('fast');

                                    setTimeout(function() {
                                        tip.hide('fast');
                                        tip.remove();
                                    }, 2000);
                                });
                            }.bind(self)
                        });
                        $("#widgets_container").disableSelection();

                        $('.edit-widget-title', dashboardContainer).tooltip();

                        widget.on('mouseover', function() {
                            editWidget.show('fast');
                            removeWidget.show('fast');
                        }).on('mouseleave', function() {
                            editWidget.hide('fast');
                            removeWidget.hide('fast');
                        })


                        removeWidget.on('click', function() {
                            var r = confirm('Are you sure you wish to delete this widget ?');
                            if (r == true) {
                                var id = widget.attr('data-id');
                                MuceData.deleteWidget(id).done(function() {
                                    widget.remove();
                                    repaintDashboards();
                                }, self).fail(function() {

                                });
                            }
                        });

                        editWidget.on('click', function() {
                            editWidgetTitleInput
                                .show('fast')
                                .focus();
                        });

                        editWidgetTitleInput.keydown(function(e) {
                            if (e.keyCode === 13) {
                                var data = _.find(widgetsData, function(item) {
                                    return item.id == editWidgetTitleInput.attr('data-id');
                                });
                                data.title = editWidgetTitleInput.val();
                                data.user = userName;
                                data.profile_id = data.profileId;
                                data.group_id = data.groupId;
                                data.report_id = data.reportId;
                                data.dashboard_id = data.dashboardId;

                                MuceData.updateWidget(data).done(function() {
                                    $('.widget-title', editWidgetTitleInput.parent()).html(data.title);
                                    editWidgetTitleInput.hide('fast');
                                });
                            }
                        }).blur(function() {
                            editWidgetTitleInput.hide('fast');
                        });
                    });
                } else {
                    if (!$('.no-widget-info', dashboardContainer).length) {
                        var info = $('<div/>').addClass('alert alert-info no-widget-info');
                        var close = $('<button/>').addClass('close')
                            .attr('data-dismiss', 'alert')
                            .html('x');
                        info.append(close);
                        info.append('Please Go <a href="/report">Custom Reporting</a> To Add Widget');
                        dashboardContainer.append(info);
                    }
                }

            });
        }

        return {
            init: function() {
                var self = this;
                MuceCom.updateDate(30, commonFilter);

                $('input[type="date"]', commonFilter).keydown(function(event) {
                    if (event.keyCode == 13) {
                        this.refresh();
                    }
                }.bind(this));

                $('.refresh-dashboard', commonFilter).click(function() {
                    this.refresh();
                }.bind(this));
            },

            refresh: function() {
                var self = this;
                var date = MuceCom.getDate(commonFilter);

                MuceData.getDashboardByUser(userName).done(function(resp) {
                    if (resp && resp.length) {
                        var dashboardList = $('.dashboard-list').html('');
                        var addDashboardItem = $('<li/>');
                        var addDashboardLink = $('<a/>').attr('href', 'javascript:void(0)')
                            .addClass('add-dashboard')
                            .html('+ New Dashboard');
                        addDashboardItem.append(addDashboardLink);
                        dashboardList.append(addDashboardItem);

                        $('.add-dashboard').on('click', function() {
                            var nameInput = $('.dashboard-name');
                            if (nameInput.length) {
                                nameInput.show();
                            } else {
                                var listItem = $('<li/>');
                                var nameInput = $('<input/>').attr({
                                    'rel': 'tooltip',
                                    'data-placement': "bottom",
                                    'data-original-title': 'Enter「Return」To Add Dashboard'
                                })
                                    .addClass('dashboard-name');
                                listItem.append(nameInput);
                                $(this).parent().before(listItem);
                            }

                            nameInput.tooltip();

                            $('.dashboard-name').keydown(function(event) {
                                if (event.keyCode == 13) {
                                    var title = $('.dashboard-name').val();
                                    if (title.length) {
                                        var data = {
                                            user: userName,
                                            name: title
                                        }
                                        MuceData.addDashboard(data).done(function() {
                                            self.refresh();
                                        });
                                    }
                                }
                            }).on('blur', function() {
                                $(this).hide();
                            });
                        });


                        _.each(resp, function(item, index) {
                            var name = item.name == '' ? 'My Dashboard' : item.name;
                            var className = !! index ? '' : 'active';
                            var listItem = $('<li/>').attr('data-id', item.id)
                                .addClass(className);
                            var link = $('<a/>').attr('href', 'javascript:void(0)')
                                .html(name);
                            var shareDashboard = $('<i/>')
                                .attr({
                                    'data-toggle': "modal",
                                    'data-target': "#share_dashboard",
                                    'title': 'Share'
                                })
                                .addClass('icon-share share-dashboard');
                            var editIcon = $('<i/>').addClass('icon-pencil edit-dashboard-name');
                            var deleteIcon = $('<i/>').addClass('icon-trash delete-dashboard');

                            listItem.append(link)
                                .append(shareDashboard)
                                .append(editIcon)
                                .append(deleteIcon);

                            $('.add-dashboard').parent().before(listItem);
                        });

                        $('li', dashboardList).on('mouseover', function() {
                            var self = $(this);
                            $('i', self).show('fast');
                        }).on('mouseleave', function() {
                            var self = $(this);
                            $('i', self).hide('fast');
                        }).on('click', function() {
                            var self = $(this);
                            if (!$('.add-dashboard', self).length) {
                                $('li', dashboardList).removeClass('active');
                                self.addClass('active');
                                getWidgetsByDashboard(self.attr('data-id'));
                            }
                        });


                        var dashboardId;
                        $('.share-dashboard', dashboardList).unbind('click').on('click', function() {
                            var item = $(this);
                            dashboardId = item.parent().attr('data-id');
                            $('.share-dashboard-error-tip').html('');
                            $('#share_dashboard textarea[name="to_users"]').val('')
                        });

                        $('#share_dashboard .submit').unbind('click').on('click', function() {
                            var data = {
                                user: userName,
                                to_users: $('#share_dashboard textarea[name="to_users"]').val()
                            }

                            MuceData.shareDashboard(dashboardId, data).done(function() {
                                $('#share_dashboard').modal('hide');
                            }).fail(function(resp) {
                                $('.share-dashboard-error-tip').html(resp.responseText);
                            });
                        });

                        $('#share_dashboard .close-modal').on('click', function() {
                            $('#share_dashboard').modal('hide');
                        });

                        $('.edit-dashboard-name', dashboardList).on('click', function() {
                            var target = $(this);
                            var listItem = $(this).parent();
                            var inputName = $('.update-dashboard-name');
                            if (inputName.length) {
                                inputName.show();
                            } else {
                                var inputName = $('<input/>').attr({
                                    'rel': 'tooltip',
                                    'data-placement': "bottom",
                                    'data-original-title': 'Enter「Return」To Update Title'
                                })
                                    .addClass('update-dashboard-name');
                            }
                            inputName.val($('a', listItem).text());
                            $('a', listItem).hide();
                            listItem.append(inputName);
                            inputName.focus().tooltip();

                            inputName.on('keydown', function(event) {
                                if (event.keyCode == 13) {
                                    var title = inputName.val();
                                    if (title.length) {
                                        var data = {
                                            id: listItem.attr('data-id'),
                                            name: title,
                                            user: userName
                                        }
                                        MuceData.updateDashbaord(data).done(function() {
                                            self.refresh();
                                        });
                                    }

                                }
                            }).on('blur', function() {
                                $('a', listItem).show();
                                inputName.hide();
                            });
                        });

                        $('.delete-dashboard', dashboardList).on('click', function() {
                            var r = confirm('Are you sure you wish to delete this dashboard ?');
                            if (r == true) {
                                var id = $(this).parent().attr('data-id');
                                MuceData.deleteDashboard(id).done(function() {
                                    self.refresh();
                                });
                            }
                        });
                        var id = $('li.active', dashboardList).attr('data-id');
                        getWidgetsByDashboard(id);
                    }
                });

            }
        }
    }

    var dashboard;
    var factory = _.extend(function() {}, {
        getInstance: function() {
            if (!dashboard) {
                dashboard = new Dashboard();
                dashboard.init();
            }
            return dashboard;
        }
    });

    return factory;
});