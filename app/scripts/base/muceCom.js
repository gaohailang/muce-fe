define([
    'base/suggestion',
    'base/formModal',
    'base/const'
], function(Suggestion, FormModal, Const) {

    var Com = {
        moduleList: ['report', 'mq'],

        getNameFromCookie: function() {
            var cookie = document.cookie;
            var arr = cookie.split('; ');
            var name = "";
            _.each(arr, function(item) {
                if (item.indexOf('name=') != -1) {
                    name = item.replace('name=', '');
                }
            });
            // Todo
            return name || 'gaohailang';
        },

        format: function(s, arg0) {
            var args = arguments;
            return s.replace(/\{(\d+)\}/ig, function(a, b) {
                var ret = args[(b | 0) + 1];
                return ret == null ? '' : ret;
            });
        },

        formatDate: function(date, spliter) {
            var spliter = spliter || '/';
            var retDate = '';
            var array = date.match(/(\d{4})(\d{2})(\d{2})/);
            retDate = array[1] + spliter + array[2] + spliter + array[3];

            return retDate;
        },

        updateTitle: function(title) {
            document.title = 'Muce - ' + title;
        },

        getUTCDateByDateAndPeriod: function(date, period) {
            var retDate;
            var dateAry = [];
            switch (period) {
                case 'second':
                    dateAry = date.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
                    retDate = Date.UTC(dateAry[1], dateAry[2] - 1, dateAry[3], dateAry[4], dateAry[5], dateAry[6]);
                    break;
                case 'minute':
                    dateAry = date.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/);
                    retDate = Date.UTC(dateAry[1], dateAry[2] - 1, dateAry[3], dateAry[4], dateAry[5]);
                    break;
                case 'hour':
                    dateAry = date.match(/(\d{4})(\d{2})(\d{2})(\d{2})/);
                    retDate = Date.UTC(dateAry[1], dateAry[2] - 1, dateAry[3], dateAry[4]);
                    break;
                default:
                    dateAry = date.match(/(\d{4})(\d{2})(\d{2})/);
                    retDate = Date.UTC(dateAry[1], dateAry[2] - 1, dateAry[3]);
            }

            return retDate;
        },

        getIntervalByPeriod: function(period) {
            var retVal;
            switch (period) {
                case 'hour':
                    retVal = 3600 * 1000;
                    break;
                case 'day':
                    retVal = 24 * 3600 * 1000;
                    break;
                case 'week':
                    retVal = 7 * 24 * 3600 * 1000;
                    break;
                case 'month':
                    retVal = 31 * 24 * 3600 * 1000;
                    break;
            }

            return retVal;
        },

        updateDate: function(timeSpan, container) {
            var today = new Date();

            var endYear = today.getFullYear();
            var endMonth = today.getMonth() + 1;
            var endDate = today.getDate();
            endMonth = ('' + endMonth).length == 1 ? '0' + endMonth : endMonth;
            endDate = ('' + endDate).length == 1 ? '0' + endDate : endDate;

            var start = new Date();
            start.setDate(endDate - timeSpan);

            var startYear = start.getFullYear();
            var startMonth = start.getMonth() + 1;
            var startDate = start.getDate();
            startMonth = ('' + startMonth).length == 1 ? '0' + startMonth : startMonth;
            startDate = ('' + startDate).length == 1 ? '0' + startDate : startDate;

            $('.start-date', container).val(startMonth + '/' + startDate + '/' + startYear);
            $('.end-date', container).val(endMonth + '/' + endDate + '/' + endYear);
        },

        getDate: function(container) {
            if (!container) {
                container = $('.common-filter-wrapper');
            }
            var format = function(str) {
                var date = str;
                var time = '0000'
                if (str.indexOf(' ') != -1) {
                    var array = str.split(' ');
                    date = array[0];
                    time = array[1];
                }

                var newDateArray = date.split('/');
                var newDate = [newDateArray[2], newDateArray[0], newDateArray[1]].join('');
                return newDate + time.replace(/:/g, '');
            }

            var startDate = $('.start-date', container).val();
            var endDate = $('.end-date', container).val();

            return {
                start: format(startDate),
                end: format(endDate),
                originStart: startDate,
                originEnd: endDate
            }
        },

        formatHashToName: function(sourceData, currentData, type) {
            var current;
            if (currentData[type]) {
                var currentName = typeof currentData[type] === 'string' ? currentData[type] : currentData[type].name;
                current = _.find(sourceData, function(item) {
                    return item.name === currentName;
                });
            }

            if (!current && typeof currentData[type] === 'string') {
                current = _.find(sourceData, function(item) {
                    return item.name === currentData[type].replace(/_/g, ' ');
                });
            }

            if (!current && typeof currentData[type] === 'string') {
                current = _.find(sourceData, function(item) {
                    return item.name === decodeURIComponent(currentData[type]);
                });
            }

            return current;
        },

        formatNameToHash: function(name) {
            return encodeURIComponent(name);
        },

        formatNumberByThousandSeparator: function(num) {
            return num * 1 <= 1 ? num : (num + '').replace(/(?!^)(?=(?:[0-9]{3})+$)/g, ',');
        },

        validateReg: '^[^\\\?/\u4e00-\u9fa5]+$',

        validateTip: 'Required. Chinese, Question mark and a slash is not allowed.',

        validateName: function(value) {
            var reg = /^[^\?/\u4e00-\u9fa5]+$/;
            return reg.test(value);
        },

        validateElement: function(elem, tip) {
            $(elem).on('keyup', function() {
                if (!Com.validateName($(elem).val())) {
                    tip.show();
                } else {
                    tip.hide();
                }
            });
        },

        buildComboSearch: function(resp, comboSelectAry, callback) {
            _.each(comboSelectAry, function(comboSelect) {
                comboSelect = $(comboSelect);
                var wrapper = $(comboSelect.parents('.controls')[0]);
                wrapper.addClass('combo-search-wrapper');
                var comboInput = $('.combo-input', wrapper);
                var dataWrapper;
                if (!comboInput.length) {
                    var name = resp.length ? (resp[0].name ? resp[0].name : resp[0]) : '';
                    comboInput = $('<input/>').addClass('combo-input').val(name);
                    wrapper.append(comboInput);

                    dataWrapper = $('<ul/>').addClass('filter-data nav nav-list"');
                    wrapper.append(dataWrapper);

                } else {
                    var val = $('option', comboSelect).length ? $('option', comboSelect)[0].text : '';
                    comboInput.val(val);
                    dataWrapper = $('.filter-data', wrapper).html('');
                }

                var updateCallback = function(target) {
                    var id = target.attr('data-id');
                    var option = _.find($('option', comboSelect), function(item) {
                        return $(item).attr('value') == id;
                    });
                    option.selected = true;
                    comboInput.val(target.text());

                    callback && callback(id, resp);
                }

                comboSelect.unbind('change').on('change', function() {
                    var id = $(this).val();
                    var text = $(this[this.selectedIndex]).text();
                    comboInput.val(text);

                    callback && callback(id, resp);
                });

                comboInput.unbind('keydown').keydown(function(event) {
                    if (event.keyCode == 38) {
                        var current = $('li.active', dataWrapper);
                        if (!current.length) {
                            $('li', dataWrapper).first().addClass('active')
                        } else {
                            $(current[0].previousSibling).addClass('active');
                            current.removeClass('active')
                        }
                        updateCallback($('li.active', dataWrapper));
                    } else if (event.keyCode == 40) {
                        var current = $('li.active', dataWrapper);
                        if (!current.length) {
                            $('li', dataWrapper).first().addClass('active');
                        } else {
                            current.next().addClass('active');
                            current.removeClass('active')
                        }

                        updateCallback($('li.active', dataWrapper));
                    } else if (event.keyCode == 13) {
                        var current = $('li.active', dataWrapper);
                        if (current.length) {
                            updateCallback(current);
                        }
                        dataWrapper.hide();
                    } else {
                        setTimeout(function() {
                            var val = comboInput.val();
                            var data = _.filter(resp, function(item) {
                                return (item.name ? item.name : item).toLowerCase().indexOf(val.toLowerCase()) != -1;
                            });
                            dataWrapper.html('').show();
                            _.each(data, function(d) {
                                var id = d.id ? d.id : d;
                                var name = d.name ? d.name : d;

                                var span = $('<li/>').attr('data-id', id).html(name);
                                dataWrapper.append(span);
                            });

                            $('li', dataWrapper).on('click', function(e) {
                                var target = $(e.target);
                                updateCallback(target);
                                dataWrapper.hide();
                            }.bind(self));

                            $('li', dataWrapper).on('mouseover', function(e) {
                                var target = $(e.target);
                                $('li', dataWrapper).removeClass('active');
                                target.addClass('active');
                            });
                        }, 0);

                    }

                });
            });

        },

        getGeoISOName: function(cName, region) {
            if (region == 'CITY') {
                regionMap = Const.isoCityMap;
            } else if (region == 'PROVINCE') {
                regionMap = Const.isoProvinceMap;
            } else {
                return;
            }
            if (cName in regionMap) {
                return regionMap[cName];
            } else {
                return '-';
            }
        },

        calcuDataForPie: function(data, config) {
            var num = config.topNum;
            var dimensionNum = num <= 0 ? num : num * -1;

            var metric = config.currentMetricId;

            var id = config.currentDimensionId;
            var allDimensionsName = _.pluck(data.result, 'd' + id);
            var uniqDimensionsName = _.uniq(allDimensionsName);

            var pieData = [];
            var totalByPieData = 0;
            _.each(uniqDimensionsName, function(dimenName) {
                var tempArray = [];
                tempArray.push(dimenName);

                var allValues = _.filter(data.result, function(item) {
                    return item['d' + id] == dimenName;
                });

                var totalVal = 0;
                _.each(allValues, function(item) {
                    if (item[metric]) {
                        totalVal += item[metric] * 1;
                    }
                });
                tempArray.push(totalVal);

                totalByPieData += totalVal;
                pieData.push(tempArray);
            });



            var sortedPieData = _.sortBy(pieData, function(item) {
                return item[1];
            }).slice(dimensionNum);

            var sortedPieDataTotal = 0;
            _.each(sortedPieData, function(item) {
                sortedPieDataTotal += item[1];
            });
            var other = ['Others', data.summary[metric + '_sum'] - sortedPieDataTotal];

            var lastItem = sortedPieData[sortedPieData.length - 1];
            var newLastItem = {
                name: lastItem[0],
                y: lastItem[1],
                sliced: true,
                selected: true
            }
            sortedPieData[sortedPieData.length - 1] = newLastItem;

            if (other[1]) {
                sortedPieData.push(other);
            }

            return sortedPieData;
        },

        drawPieByDimension: function(data, config) {

            var seriesData = Com.calcuDataForPie(data, config);
            var pieDimensionChart = new Highcharts.Chart({
                chart: {
                    renderTo: config.containerId,
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: ''
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.y}</b>',
                    percentageDecimals: 1
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            color: '#000000',
                            connectorColor: '#000000',
                            formatter: function() {
                                return '<b>' + this.point.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                            }
                        }
                    }
                },
                series: [{
                    type: 'pie',
                    name: _.find(config.metricsData, function(item) {
                        return item.id == config.currentMetricId;
                    }).name,
                    data: seriesData
                }]
            });
        },

        calcuDataForArea: function(data, config) {

            var parseStartData = function(date) {
                var retDate = _.sortBy(_.uniq(date), function(item) {
                    return item;
                });
                return retDate[0];
            }

            var num = config.topNum;
            var dimensionNum = num <= 0 ? num : num * -1;

            var metric = config.currentMetricId;

            var id = config.currentDimensionId;
            var allDimensionsName = _.pluck(data.result, 'd' + id);
            var uniqDimensionsName = _.uniq(allDimensionsName);

            var areaData = [];
            _.each(uniqDimensionsName, function(dimenName) {
                var tempObj = {};
                tempObj.name = dimenName;

                var allValues = _.filter(data.result, function(item) {
                    return item['d' + id] == dimenName;
                });
                allValues = _.sortBy(allValues, function(item) {
                    return item.date;
                });
                var totalVal = 0;
                var valueArray = [];
                var dateArray = [];
                _.each(allValues, function(item) {
                    if (item[metric]) {
                        var val = item[metric] * 1;
                        totalVal += val;
                        valueArray.push(val);
                        dateArray.push(item.date);
                    }
                });

                tempObj.data = valueArray;
                tempObj.pointStart = Com.getUTCDateByDateAndPeriod(parseStartData(dateArray), data.period);
                tempObj.pointInterval = Com.getIntervalByPeriod(data.period);
                tempObj.totalVal = totalVal;
                areaData.push(tempObj);
            });

            var sortedAreaData = _.sortBy(areaData, function(item) {
                return item.totalVal;
            }).slice(dimensionNum);

            return sortedAreaData;
        },

        drawAreaByDimension: function(data, config) {

            var seriesData = Com.calcuDataForArea(data, config);
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

            var areaChart = new Highcharts.Chart({
                chart: {
                    renderTo: config.containerId,
                    type: 'area'
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: ''
                },
                subtitle: {
                    text: ''
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: {
                    title: {
                        text: ''
                    }
                },
                tooltip: {
                    formatter: function() {

                        return '' +
                            Highcharts.dateFormat(format, this.x) + ': ' + this.y;
                    }
                },
                plotOptions: {
                    area: {
                        stacking: 'normal',
                        lineColor: '#666666',
                        lineWidth: 1,
                        marker: {
                            lineWidth: 1,
                            lineColor: '#666666'
                        }
                    }
                },
                series: seriesData
            });
        },

        drawTable: function(data, config) {
            var table = $('<table/>').addClass('table table-bordered table-striped')
                .addClass(config.className);
            var metricIds = _.pluck(data.metricsData, 'id');
            var dimensionIds = _.pluck(data.dimensionsData, 'id');

            var array = [];
            array.push('<tr><th>Date</th>');
            _.each(data.dimensionsData, function(item) {
                array.push('<th>' + item.name + '</th>');
            });

            _.each(data.metricsData, function(item) {
                array.push('<th>' + item.name + '</th>');
            });
            array.push('</tr>');

            _.each(data.result, function(item, index) {
                array.push('<tr>');
                array.push('<td>' + Com.formatDate(item.date, '-') + '</td>');
                _.each(dimensionIds, function(id) {
                    array.push('<td>' + item['d' + id] + '</td>');
                });
                _.each(metricIds, function(id) {
                    array.push('<td>' + item[id] + '</td>');
                });
                array.push('</tr>');
            });

            table.html(array.join(''));

            return table;
        },

        buildFields: function(data, id, fieldsWrapper, type) {
            fieldsWrapper.html('');
            var fieldsData = _.find(data, function(d) {
                return d.id == id;
            });

            if (type == 'text') {
                if (fieldsData.fields) {
                    fieldsWrapper.html(fieldsData.fields.join(', '));
                }
            } else {
                _.each(fieldsData.fields, function(item) {
                    fieldsWrapper.append($('<option/>').val(item).text(item));
                });
            }
        },

        updateMultipleSelectItems: function(params, currentData) {
            var self = this;
            params.container.addClass('multiple-select')
                .html('');

            var selectedItemsWrapper = $('<div/>').addClass('selected-wrapper');
            var searchAndSelectWrapper = $('<div/>').addClass('search-select-wrapper');
            var itemsCheckboxWrapper = $('<div/>').addClass('checkbox-wrapper loading');
            var tip = $('<span/>').addClass('select-tip')
                .html('Selected items: None');

            var searchBox = $('<input/>').addClass('search-box suggestion-search-box')
                .attr('placeholder', 'Search');

            searchAndSelectWrapper.append(itemsCheckboxWrapper);
            searchAndSelectWrapper.append(searchBox);
            selectedItemsWrapper.append(tip);
            params.container.append(selectedItemsWrapper);
            params.container.append(searchAndSelectWrapper);

            var selectedItemChange = function() {
                if (params.selectedItemChange) {
                    var selectedIds = [];
                    _.each($('span', selectedItemsWrapper), function(item) {
                        selectedIds.push($(item).attr('data-id') * 1);
                    });

                    params.selectedItemChange(selectedIds);
                }
            }

            var removeSelectedItem = function(m) {
                if (!m) {
                    return;
                }
                m.hide(400);
                setTimeout(function() {
                    m.remove();
                    selectedItemChange();
                    if (!$('.selected-name', selectedItemsWrapper).length) {
                        selectedItemsWrapper.append(tip);
                    }
                }, 400);

            }

            var buildSelectedItem = function(id, name) {
                var checkSelectedItem = _.find($('span', selectedItemsWrapper), function(item) {
                    return $(item).attr('data-id') == id;
                });
                if (checkSelectedItem) {
                    return;
                }

                var span = $('<span/>')
                    .addClass('selected-name')
                    .attr('data-id', id);
                var deleteIcon = $('<i/>').addClass('icon-minus-sign');
                span.append(deleteIcon);
                span.append(name);

                tip.remove();
                selectedItemsWrapper.append(span);
                span.show('fast');
                selectedItemChange();

                deleteIcon.on('click', function(e) {
                    var item = $(e.target).parent();
                    var id = item.attr('data-id');
                    var m = _.find($('input', searchAndSelectWrapper), function(item) {
                        return $(item).val() == id;
                    });
                    if (m) {
                        $(m).attr('checked', false)
                    }
                    removeSelectedItem(item);
                });
            }

            var buildCheckboxItem = function(resp) {
                itemsCheckboxWrapper.html('');
                _.each(resp, function(d, index) {
                    label = $('<label/>').addClass('suggestion-item');
                    input = $('<input/>').attr({
                        type: 'checkbox',
                        //name : 'resp',
                        value: d.id,
                        'data-name': d.name
                    })
                        .addClass('select-checkbox');
                    label.append(input);
                    label.append(d.name);

                    var isSelectedItem;
                    if (params.currentDataInEdit.length) {
                        isSelectedItem = _.find(params.currentDataInEdit, function(item) {
                            return item.id == d.id;
                        });
                    }

                    if (currentData.isEditReportMode && isSelectedItem) {
                        input.attr('checked', true);
                        buildSelectedItem(d.id, d.name);
                    } else {
                        var selectedIds = [];
                        _.each($('span', selectedItemsWrapper), function(item) {
                            selectedIds.push($(item).attr('data-id') * 1);
                        });

                        if (_.indexOf(selectedIds, d.id) != -1) {
                            input.attr('checked', true);
                        }
                    }
                    itemsCheckboxWrapper.append(label);
                });
            }

            params.getDataFun(currentData.profile.id, params.getDataFunParams).done(function(resp) {
                itemsCheckboxWrapper.removeClass('loading');

                if (params.defaultSelectedId) {
                    var defaultSelectedData = _.filter(resp, function(item) {
                        return _.indexOf(params.defaultSelectedId, item.id) != -1;
                    });
                    _.each(defaultSelectedData, function(item) {
                        buildSelectedItem(item.id, item.name);
                    });
                }
                buildCheckboxItem(resp);

                searchAndSelectWrapper.delegate('.select-checkbox', 'change', function(e) {
                    var target = $(e.target);
                    var id = target.val();
                    if (target.attr('checked')) {
                        buildSelectedItem(id, target.attr('data-name'));
                    } else {
                        var m = _.find($('.selected-name', selectedItemsWrapper), function(item) {
                            return $(item).attr('data-id') == id;
                        });
                        removeSelectedItem($(m));
                    }
                });

                Suggestion({
                    container: searchAndSelectWrapper,
                    data: resp,
                    buildSuggestionCallback: function(data) {
                        buildCheckboxItem(data);
                    },
                    checkSuggestionCallback: function(current) {
                        buildSelectedItem(current.id, current.name);
                        var checkboxItem = _.find($('input', searchAndSelectWrapper), function(item) {
                            return $(item).val() == current.id;
                        });
                        if (checkboxItem) {
                            $(checkboxItem).attr('checked', true);
                        }
                    },
                    scope: self
                });
            });

            var selectItemsControls = params.container.parent();
            if (!$('.' + params.addBtnCls, selectItemsControls).length) {
                var addTarget = $('<a/>').attr({
                    'href': params.addBtnTarget,
                    'data-toggle': 'modal',
                    'class': params.addBtnCls
                });
                addTarget.append($('<i/>').addClass('icon-plus ' + params.addBtnCls));
                selectItemsControls.append(addTarget);
            }
        },

        buildModals: function(list) {
            _.each(list, function(item) {
                var info = {
                    modal_id: item.name.replace(/\s/g, '_'),
                    modal_title: item.name.toUpperCase(),
                    modal_form_id: item.name.replace(/\s/g, '_') + '_form',
                    modal_class: item.name.replace(/\s/g, '-') + '-modal',
                    modal_help: item.help
                }
                FormModal(info, item.formItems);
            });
        },

        getCurrentType: function() {
            return $('.report-tab-container button.active').attr('data-type');
        },

        getSelectedDimensions: function() {
            var dimensions = [];

            var currentType = Com.getCurrentType();
            switch (currentType) {
                case 'table':
                    _.each($('.table-wrapper .select-dimension'), function(item) {
                        var val = $(item).val();
                        if (val && val.length) {
                            dimensions.push(val * 1);
                        }
                    });
                    break;
                case 'pie':
                    dimensions.push($('#pie_content_dimensions').val() * 1);
                    break;
                case 'area':
                    dimensions.push($('#area_content_dimensions').val() * 1);
                    break;
            }


            return _.uniq(dimensions);
        },

        buildChartMetricFilter: function(container, metrics) {
            var contentMetircs = container.html('');
            var option;
            _.each(metrics, function(item) {
                option = $('<option/>').val(item.id).text(item.name);
                contentMetircs.append(option);
            });
        },

        getCurrentPeriod: function() {
            return $('.common-filter-wrapper .period-btn.active').val();
        },

        parseStrToObj: function(str) {
            var retObj = typeof str === 'object' ? str : JSON.parse(str);
            return retObj;
        },

        stringifyObj: function(obj) {
            var retStr = typeof obj === 'string' ? obj : JSON.stringify(obj);
            return retStr;
        },

        getDateDiff: function(first, second) {
            return ((Com.parseDate(second) - Com.parseDate(first)) / 86400000);
        },

        parseDate: function(str) {
            var arr = str.match(/(\d{2}).*(\d{2}).*(\d{4})/);
            return new Date(arr[3], arr[2] - 1, arr[1]);
        }
    };

    return Com;
});