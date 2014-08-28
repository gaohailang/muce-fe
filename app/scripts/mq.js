define(['base/muceData'],
    function(MuceData) {
        var Mq = function() {
            var mqViewModel;
            var sqlCodeMirror;
            var runTime;
            var runStatus;
            var moreQueryNum = 50;
            var showPartitionSchemaBtn = function() {
                $('#mq_db_tb_des .btn-group.mq-select-btn').show();
            };
            var hideRunResult = function() {
                $('#mq_result_view').hide();
            }
            var hideUserQueryExample = function() {
                $('#mq_user_query_example').hide();
            }
            var onlyShowSchemas = function() {
                hideUserQueryDetail();
                hideRunResult();
                hideUserQueryExample();
                hideUserQueryShare();
                $('#mq_partitions').hide();
                $('#mq_schemas').show();
                $('.mq-show-schemas').addClass('active');
                $('.mq-show-partitions').removeClass('active');
            };
            var hideUserQueryDetail = function() {
                $('#mq_user_query_table').hide();
            }
            var onlyShowPartitions = function() {
                hideRunResult();
                hideUserQueryDetail();
                hideUserQueryExample();
                hideUserQueryShare();
                $('#mq_schemas').hide();
                $('#mq_partitions').show();
                $('.mq-show-schemas').removeClass('active');
                $('.mq-show-partitions').addClass('active');
            };
            var hideSchemaPartition = function() {
                $('#mq_schemas').hide();
                $('#mq_partitions').hide();
            };
            var mqQuery = function() {
                $('#mq_code_mirror').html('');
                $('#mq_query').show();
                $('#mq_run').removeClass('disabled');
                sqlCodeMirror = CodeMirror($('#mq_code_mirror')[0], {
                    mode: "mysql",
                    lineNumbers: true,
                    lineWrapping: true
                });
            };
            var pad = function(number, length) {
                var str = '' + number;
                while (str.length < length) {
                    str = '0' + str;
                };
                return str;
            };

            var initRun = function() {
                $('.mq-run-time').text('0.00');
                $('.mq-run-status').html('');
                if ($('.mq-run-status').hasClass('label-warning') == false) {
                    $('.mq-run-status').removeClass('label-success label-important');
                    $('.mq-run-status').addClass('label-warning');
                };
                $('.bs-docs-example.success-example').hide();
                $('#mq_result_view').hide();
            }

            var mqRun = function(data) {
                initRun();
                var curTime = 0;
                runTime = $.timer(function() {
                    var min = parseInt(curTime / 6000);
                    var sec = parseInt(curTime / 100) - (min * 60);
                    var micro = pad(curTime - (sec * 100) - (min * 6000), 2);
                    var showTime = "";
                    if (min > 0) {
                        showTime = pad(min, 2) + ':';
                    };
                    showTime = showTime + pad(sec, 2) + ':' + micro;
                    $('.mq-run-time').html(showTime);
                    curTime += 7;
                }, 70, true);
                MuceData.putMqJob(data).done(function(resp) {
                    var jobId = resp.id;
                    showUserQueryHistory('mq_user_query_table', 'clear');
                    runStatus = $.timer(function() {
                        MuceData.getMqJobStatus(jobId).done(function(respStatus) {
                            $('.mq-run-status').text(respStatus.status);
                            if (respStatus.status == 'COMPLETED') {
                                stopRunSuccess(respStatus.id);
                            } else if (respStatus.status == 'FAILED') {
                                stopRunGetStatusError(respStatus);
                            }
                        }).fail(function(getStatusError) {
                            stopRunGetStatusError(getStatusError);
                        });
                    }, 3000, true);
                }).fail(function(resp) {
                    stopRunPutJobError(resp);
                });
            };

            var stopRunGetStatusError = function(error) {
                var node = $('<div/>');
                node.addClass('alert  alert-block alert-error');
                node.append('<a class="close" data-dismiss="alert" href="#">x</a>');
                node.append('<p>' + error.reason + '</p>');
                $('.mq-run-error-alert').html('');
                $('.mq-run-error-alert').append(node);
                $('.mq-run-error-alert').show();
                $('.mq-run-error-alert .alert-error').show();
                $('#mq_run').removeClass('disabled');
                $('.mq-run-status').removeClass('label-warning').addClass('label-important').text(error.responseText);
                runTime.stop();
                runStatus.stop();
            };

            var stopRunPutJobError = function(error) {
                runTime.stop();
                $('.mq-run-error-alert').hide();
                $('.alert-error').hide();
                $('#mq_run').removeClass('disabled');
                $('.mq-run-status').removeClass('label-warning').addClass('label-important').text(error.responseText);
            };

            var stopRunSuccess = function(id) {
                runTime.stop();
                runStatus.stop();
                showUserQueryHistory('mq_user_query_table', 'clear');
                $('#mq_run').removeClass('disabled');
                $('.mq-run-status').removeClass('label-warning');
                $('.mq-run-status').addClass('label-success');
                $('.mq-download-btn').attr('url', '/muce-webapp/muce/mq/job/' + id + '/result');
                $('.bs-docs-example.success-example').show();
                mqViewModel.mqShowViewResult(id);
            };

            var showCompleteDownloadSize = function(id) {
                MuceData.getMqResultDownloadSize(id).done(function(resp) {
                    var cmd = '.mq-download-size[jobId=' + id + ']';
                    if (resp < 1024) {
                        $(cmd).html(resp + ' Byte');
                    } else if (resp > 1024 && resp < 1048576) {
                        var size = parseFloat(resp) / 1024;
                        size = size.toFixed(2);
                        $(cmd).html(size + ' KB');
                    } else {
                        var size = (parseFloat(resp) / 1048576).toFixed(2);
                        $(cmd).html(size + ' MB');
                    }
                });
            }

            var showUserQueryHistory = function(host, clear) {
                var hostEl = $('#' + host);
                var node;
                if (clear == "clear") {
                    $('tbody', hostEl).html('');
                }
                hostEl.show();
                var userName;
                if (host == 'mq_user_query_table') {
                    userName = $('.user-name').text();
                    hideSchemaPartition();
                    hideRunResult();
                    hideUserQueryShare();
                    hideUserQueryExample();
                    node = $('.user-query-detail', hostEl);
                } else if (host == 'mq_user_query_share') {
                    userName = $('#mq_user_query_share input').val().replace(/(^\s*)|(\s*$)/g, "");
                    node = $('table', hostEl);
                }
                var data = {};
                data.order = "desc";
                data["querys_showed"] = $('tbody tr', hostEl).length;
                data["more_querys"] = moreQueryNum;
                data.user = userName;
                MuceData.getMqUserHistory(data).done(function(resp) {
                    _.each(resp, function(item) {
                        var hql = item.hql;
                        var status = item.status;
                        var id = item.id;
                        var download = '/muce-webapp/muce/mq/job/' + id + '/result';
                        var add = $('<tr/>');
                        add.addClass('mq-user-query-row');
                        add.append('<td>' + status + '</td>');
                        if (status == 'COMPLETED') {
                            add.append('<td><a href="#mq_history_view" jobId="' + id + '" class="mq-history-result-view" data-toggle="modal">View</a></td>');
                            add.append('<td><a href=' + download + '>download</a></td>');
                            add.append('<td class="mq-download-size" jobId="' + id + '">unknown</td>');
                            showCompleteDownloadSize(id);
                        } else if (status == 'FAILED') {
                            add.append('<td><a href="#mq_history_view" jobId="' + id + '" class="mq-history-result-view" data-toggle="modal">View</a></td>');
                            add.append('<td>FAILED</td>');
                            add.append('<td>unknown</td>');
                            add.addClass('error');
                        } else if (status == 'PENDING') {
                            add.append('<td>pending... </td>');
                            add.append('<td>pending...</td>');
                            add.append('<td>unknown</td>');
                            add.addClass('info');
                        } else {
                            add.append('<td>running... </td>');
                            add.append('<td>running...</td>');
                            add.append('<td>unknown</td>');
                            add.addClass('info');
                        }
                        add.append('<td class="mq-hql">' + hql + '</td>');
                        node.append(add);
                    });
                    if (resp.length < moreQueryNum) {
                        $('.mq-more-querys').hide();
                    } else {
                        $('.mq-more-querys', hostEl).show();
                    }
                });
            };

            var showUserQueryExample = function() {
                hideSchemaPartition();
                hideRunResult();
                hideUserQueryDetail();
                hideUserQueryShare();
                $('#mq_user_query_example').show();
            }

            var showRunResult = function() {
                hideSchemaPartition();
                hideUserQueryDetail();
                hideUserQueryShare();
                hideUserQueryExample();
                $('#mq_result_view').show();
            }

            var hideUserQueryShare = function() {
                $('#mq_user_query_share').hide();
            }
            var showUserQueryShare = function() {
                hideSchemaPartition();
                hideRunResult();
                hideUserQueryDetail();
                hideUserQueryExample();
                $('#mq_user_query_share tbody').html('');
                $('#mq_user_query_share').show();
            }
            var hasShowPartition = false;

            return {
                init: function() {
                    mqViewModel = {
                        mqDataBases: ko.observableArray([]),
                        mqTables: ko.observableArray([]),
                        mqSchemas: ko.observableArray([]),
                        mqPartitions: ko.observableArray([]),
                        mqViewResult: ko.observableArray([]),
                        mqSelectDatabase: ko.observable(''),
                        mqSelectTable: ko.observable(''),
                        mqUserHistoryHql: ko.observableArray([]),
                        mqShowTables: function(database, e) {
                            mqViewModel.mqSelectDatabase(database);
                            mqViewModel.mqSelectTable('');
                            mqViewModel.mqSchemas([]);
                            mqViewModel.mqTables([]);
                            mqViewModel.mqPartitions([]);
                            hideSchemaPartition();
                            $(event.target).parent().append($('.mq-tables'));
                            $.get('/muce-webapp/muce/mq/' + mqViewModel.mqSelectDatabase() + '/tables').done(function(data) {
                                mqViewModel.mqTables(data);
                            });
                        },
                        mqShowSchemas: function(table, e) {
                            mqViewModel.mqSelectTable(table);
                            showPartitionSchemaBtn();
                            hasShowPartition = false;
                            onlyShowSchemas();
                            var selectDb = mqViewModel.mqSelectDatabase();
                            var selectTb = mqViewModel.mqSelectTable();
                            MuceData.getMqSchemas(selectDb, selectTb).done(function(data) {
                                mqViewModel.mqSchemas(data);
                            });
                        },

                        mqShowPartitions: function(e) {
                            var db = mqViewModel.mqSelectDatabase();
                            var table = mqViewModel.mqSelectTable();
                            MuceData.getMqPartitions(db, table).done(function(resp) {
                                mqViewModel.mqPartitions(resp.reverse());
                            });
                        },

                        mqShowViewResult: function(id, e) {
                            MuceData.getMqJobView(id).done(function(resp) {
                                var data = resp.split('\n').slice(0, 100);
                                var node = $('.mq-result-view');
                                node.html('');
                                _.each(data, function(line) {
                                    var addRow = $('<tr/>');
                                    var arr = line.split('\t');
                                    _.each(arr, function(item) {
                                        addRow.append('<td>' + item + '</td>');
                                    });
                                    node.append(addRow);
                                })
                            });
                        }
                    };
                    ko.applyBindings(mqViewModel, $('#mq_container')[0]);
                    showUserQueryHistory('mq_user_query_table', 'clear');
                    mqQuery();
                    MuceData.getMqDataBases().done(function(data) {
                        mqViewModel.mqDataBases(data);
                    });
                    $('#mq_db_tb_des .mq-show-partitions').on('click', function() {
                        if (hasShowPartition == false) {
                            mqViewModel.mqShowPartitions();
                            hasShowPartition = true;
                            onlyShowPartitions();
                        } else {
                            onlyShowPartitions();
                        }
                    });
                    $('#mq_db_tb_des .mq-show-schemas').on('click', function() {
                        onlyShowSchemas();
                    });
                    $('#mq_compose_query button').on('click', function() {
                        $('#mq_compose_query button').removeClass('btn-primary');
                        mqQuery();
                        runTime.stop();
                        runStatus.stop();
                        initRun();
                    });
                    $('#mq_run').on('click', function() {
                        if ($('#mq_run').hasClass('disabled')) {
                            return
                        }
                        $('#mq_run').addClass('disabled');
                        var userName = $('.user-name').text();
                        var hql = $.trim(sqlCodeMirror.getValue());
                        var notification = false;
                        if ($('#mq_run_animate .mq-notification input:checked').length == 1) {
                            notification = true;
                        }
                        var data = {
                            user: userName,
                            hql: hql,
                            notification: notification
                        };
                        mqRun(data);
                    });
                    $('#mq_user_query .mq-history').on('click', function() {
                        showUserQueryHistory('mq_user_query_table', 'clear');
                    });
                    $('#mq_user_query .mq-example').on('click', function() {
                        showUserQueryExample();
                    });

                    $('#mq_user_query .share-query').on('click', function() {
                        $('#mq_user_query_share .mq-more-querys').hide();
                        showUserQueryShare();
                    });

                    $('#mq_user_query_share .mq-search').on('click', function() {
                        showUserQueryHistory('mq_user_query_share', 'clear');
                    });

                    $('#mq_user_query_share input').keydown(function(e) {
                        if (e.keyCode == 13) {
                            showUserQueryHistory('mq_user_query_share', 'clear');
                        }
                    });

                    $('.mq-download-btn').click(function() {
                        location.href = $(event.target).attr('url');
                    });
                    $('.mq-show-run-result').click(function() {
                        showRunResult();
                    });
                    $('#mq_user_query_table').on('click', '.mq-user-query-row .mq-hql', function(event) {
                        sqlCodeMirror.setValue($(event.target).text());
                    });
                    $('#mq_user_query_table,#mq_user_query_share').on('click', '.mq-history-result-view', function() {
                        $('#mq_history_view').remove();
                        var target = $(event.target);
                        var hql = target.parent().nextAll('.mq-hql').text();
                        var id = target.attr('jobId');
                        MuceData.getMqJobStatus(id).done(function(resp) {
                            if (resp.status == 'FAILED') {
                                var reason = resp.reason;
                                var modal = _.template($('#mq_history_view_fail_modal').html(), {
                                    hql: hql,
                                    reason: reason
                                });
                                $('body').append(modal);
                                $('#mq_history_view').modal();
                            } else if (resp.status == 'COMPLETED') {
                                MuceData.getMqJobView(id).done(function(data2) {
                                    var modal = _.template($('#mq_history_view_modal').html());
                                    $('body').append(modal);
                                    var data = data2.split('\n').slice(0, 100);
                                    var node = $('#mq_history_view .mq-result-view');
                                    node.html('');
                                    _.each(data, function(line) {
                                        var addRow = $('<tr/>');
                                        var arr = line.split('\t');
                                        _.each(arr, function(item) {
                                            addRow.append('<td>' + item + '</td>');
                                        });
                                        node.append(addRow);
                                    });
                                    $('#mq_history_view').modal();
                                });
                            }
                        });

                    });
                    $('#mq_user_query_table .mq-more-querys').on('click', function() {
                        showUserQueryHistory('mq_user_query_table');
                    })
                    $('#mq_user_query_share .mq-more-querys').on('click', function() {
                        showUserQueryHistory('mq_user_query_share');
                    })
                }
            }
        };
        var mq;
        var factory = _.extend(function() {}, {
            getInstance: function() {
                if (!mq) {
                    mq = new Mq();
                    mq.init();
                }
                return mq;
            }
        });
        return factory;
    });