define([
    'base/muceData',
    'base/muceCom'
], function(MuceData, MuceCom) {

    var Subscribe = function() {
        function addCol2Row(row, metric, subscribe_metrics) {
            var col = $('<div/>').attr('class', 'span4');
            var label = $('<label/>').attr('class', 'checkbox').html(metric.name);
            var input = $('<input/>').attr({
                'type': 'checkbox',
                'value': metric.id
            });
            if (subscribe_metrics != null && subscribe_metrics.indexOf(metric.id) >= 0) {
                input.attr('checked', true);
            }
            label.append(input);
            col.append(label);
            row.append(col);
        }

        function addSubscribeBtn2BodyFrag(bodyFrag) {
            var item = $('<section/>').attr('id', 'subscribe');
            var pageHeader = $('<div/>').append($('<h1/>')
                .html('Subscribe'));
            var subscribeDiv = $('<div/>').attr('class', 'download-btn');
            var subscribeBtn = $('<a/>').attr({
                'class': 'btn btn-primary',
                // 'href': '#',
                'id': 'subscribeBtn'
            })
                .html('Customize and Subscribe');
            subscribeDiv.append(subscribeBtn);
            item.append(subscribeDiv);
            bodyFrag.appendChild(item[0]);
        }

        function getSubscribeMetricIds(subscribe) {
            if (subscribe === null) {
                return null;
            }
            len = subscribe.metrics.length;
            var arr = new Array(len);
            for (var i = 0; i < len; i++) {
                arr[i] = parseInt(subscribe.metrics[i]);
            }
            return arr;
        }

        function bindSubscribeBtnEvent(subscribe) {
            $('#subscribeBtn').on('click', function() {
                var metrics = new Array();
                var arr = $('#form input:checked');

                _.each(arr, function(item, index) {
                    metrics.push(parseInt($(item).val()));
                })
                subscribe.metrics = metrics.join(',');
                MuceData.upsertSubscribe(subscribe)
                    .done(function() {
                        alert('Subscribe success.');
                    })
                    .fail(function() {
                        alert('Subscribe fail.');
                    });
            });
        }

        (function init() {

            function buildMetrics(profiles, subscribe_metrics) {
                var sidebarItem;
                var bodyItem;
                var sidebarFrag = document.createDocumentFragment();
                var bodyFrag = document.createDocumentFragment();
                _.each(profiles, function(profile) {
                    // Sidebar content
                    sidebarItem = $('<li/>');
                    sidebarItem.append($('<a/>')
                        .attr({
                            'href': '#' + profile.name
                        })
                        .html(profile.name)
                        .append($('<i/>')
                            .attr('class', 'icon-chevron-right')));
                    sidebarFrag.appendChild(sidebarItem[0]);

                    // Body Content
                    bodyItem = $('<section/>').attr('id', profile.name);
                    var pageHeader = $('<div/>').append($('<h1/>')
                        .html(profile.name));
                    var pageBody = $('<div>').attr('class', 'bs-docs-grid');
                    var row;
                    MuceData.getMetricsByProfile(profile.id).done(function(metrics) {
                        len = metrics.length;
                        _.each(metrics, function(metric, index) {
                            if (0 == index % 3) {
                                row = $('<div/>').attr('class', 'row-fluid show-grid');
                                addCol2Row(row, metric, subscribe_metrics);
                            } else if (2 == index % 3 || len - 1 == index) {
                                addCol2Row(row, metric, subscribe_metrics);
                                pageBody.append(row);
                            } else {
                                addCol2Row(row, metric, subscribe_metrics);
                            }
                        });
                    });
                    bodyItem.append(pageHeader);
                    bodyItem.append(pageBody);
                    bodyFrag.appendChild(bodyItem[0]);
                });
                addSubscribeBtn2BodyFrag(bodyFrag);
                $('#sub_profile_list')[0].appendChild(sidebarFrag);
                $('#form')[0].appendChild(bodyFrag);
            }

            var name = MuceCom.getNameFromCookie();

            MuceData.getSubscribeByUser(name).done(function(subscribe) {
                if (subscribe === null) {
                    subscribe = {
                        "user": name,
                        "metrics": new Array()
                    };
                }
                var subscribe_metrics = getSubscribeMetricIds(subscribe);
                MuceData.getProfiles()
                    .done(function(data) {
                        buildMetrics(data, subscribe_metrics);
                        $('#sub_profile_list li').on('click', function(e) {
                            $('#sub_profile_list li').removeClass('active');
                            $(e.target).parent().addClass('active');
                        }.bind(this));
                        bindSubscribeBtnEvent(subscribe);
                    })
                    .fail(function(data) {});
            });
        })();
    };

    return _.extend(function() {}, {
        getInstance: function() {
            return new Subscribe();
        }
    });
});