define(['base/muceCom'], function(MuceCom) {

    var MuceData = function() {
        var config = {
            GET_LOG_TYPES: '/muce-webapp/muce/meta/static/log_types',
            GET_LOG_PERIODS: '/muce-webapp/muce/meta/static/log_periods',
            GET_PROFILES: '/muce-webapp/muce/meta/profiles',
            UPDATE_PROFILE: '/muce-webapp/muce/meta/profile',
            GET_GROUPS_BY_PROFILE: '/muce-webapp/muce/meta/{0}/report_groups',
            GET_REPORTS_BY_PROFILE: '/muce-webapp/muce/meta/{0}/reports',
            GET_PROFILE_BY_ID: '/muce-webapp/muce/meta/profile/{0}',
            UPDATE_EVENT: '/muce-webapp/muce/meta/event/{0}',
            GET_GROUP_BY_ID: '/muce-webapp/muce/meta/report_group/{0}',
            GET_REPORT_BY_ID: '/muce-webapp/muce/meta/report/{0}',
            ADD_PROFILE: '/muce-webapp/muce/meta/profile',
            ADD_GROUP: '/muce-webapp/muce/meta/report_group',
            UPDATE_GROUP: '/muce-webapp/muce/meta/report_group',
            GET_REPORT_DATA: '/muce-webapp/muce/report/{0}',
            GET_METRICS_BY_PROFILE: '/muce-webapp/muce/meta/{0}/unfiltered_metrics',
            GET_DIMENSIONS_BY_PROFILE: '/muce-webapp/muce/meta/{0}/dimensions',
            ADD_REPORT: '/muce-webapp/muce/meta/report',
            DELETE_REPORT: '/muce-webapp/muce/meta/report/{0}',
            UPDATE_REPORT: '/muce-webapp/muce/meta/report',
            GET_EVENTS_BY_PROFILE: '/muce-webapp/muce/meta/{0}/unfiltered_events',
            ADD_METRIC: '/muce-webapp/muce/meta/metric',
            ADD_DIMENSION: '/muce-webapp/muce/meta/dimension',
            GET_SUBSCRIBE_BY_USER: '/muce-webapp/muce/subscribe/{0}',
            UPS_SUBSCRIBE: '/muce-webapp/muce/subscribe',
            UPDATE_DIMENSION: '/muce-webapp/muce/meta/dimension',
            UPDATE_METRIC: '/muce-webapp/muce/meta/metric',
            DELETE_METRIC: '/muce-webapp/muce/meta/metric/{0}',
            DELETE_DIMENSION: '/muce-webapp/muce/meta/dimension/{0}',
            GET_FUNCS: '/muce-webapp/muce/meta/static/funcs',
            ADD_UDF: '/muce-webapp/muce/meta/udf',
            UPDATE_UDF: '/muce-webapp/muce/meta/udf',
            GET_UDFs: '/muce-webapp/muce/meta/{0}/udfs',
            GET_UDFs_BY_PROFILE_EVENT: '/muce-webapp/muce/meta/{0}/{1}/udfs',
            DELETE_UDF: '/muce-webapp/muce/meta/udf/{0}',
            DELETE_GROUP: '/muce-webapp/muce/meta/report_group/{0}',
            ADD_ANNOTATION: '/muce-webapp/muce/annotation',
            DELETE_ANNOTATION: '/muce-webapp/muce/annotation/{0}',
            GET_COMPARE_SUMMARY: '/muce-webapp/muce/subscribe/compare_summary/{0}',
            GET_COMPARE_DETAIL: '/muce-webapp/muce/subscribe/compare_detail/{0}',
            GET_CHANNELS: '/muce-webapp/muce/channels/{0}',
            PUT_CHANNELS: '/muce-webapp/muce/channels/{0}',
            DELETE_CHANNELS: '/muce-webapp/muce/channels/{0}?name={1}',
            GET_DASHBOARD_BY_USER: '/muce-webapp/muce/dashboard/{0}/dashboards',
            ADD_DASHBOARD: '/muce-webapp/muce/dashboard',
            DELETE_DASHBOARD: '/muce-webapp/muce/dashboard/{0}',
            UPDATE_DASHBOARD: '/muce-webapp/muce/dashboard',
            SHARE_DASHBOARD: '/muce-webapp/muce/dashboard/share/{0}',
            GET_WIDGETS_BY_DASHBOARD: "/muce-webapp/muce/dashboard/{0}/widgets",
            ADD_WIDGET: '/muce-webapp/muce/dashboard/widget',
            DELETE_WIDGET: '/muce-webapp/muce/dashboard/widget/{0}',
            UPDATE_WIDGET: '/muce-webapp/muce/dashboard/widget',
            UPDATE_WIDGETS_POSITOIN: '/muce-webapp/muce/dashboard/widget/positions',
            GET_UNIQ_FIELDS: '/muce-webapp/muce/meta/{0}/lived_uniq_fields',
            GET_DIMENSION_DATA: '/muce-webapp/muce/report/{0}/{1}',
            GET_MQ_DATABASES: '/muce-webapp/muce/mq/databases',
            PUT_MQ_JOB: '/muce-webapp/muce/mq/job',
            GET_MQ_PARTITION: '/muce-webapp/muce/mq/{0}/{1}/partitions',
            GET_MQ_SCHEMA: '/muce-webapp/muce/mq/{0}/{1}/schema',
            GET_MQ_JOB_STATUS: '/muce-webapp/muce/mq/job/{0}',
            GET_MQ_USER_HISTORY_QUERY: '/muce-webapp/muce/mq/job',
            GET_MQ_JOB_RESULT_VIEW: '/muce-webapp/muce/mq/job/{0}/view',
            GET_MQ_RESULT_DOWNLOAD_SIZE: '/muce-webapp/muce/mq/job/{0}/result/size',
            RE_RUN_REPORT_BY_REPORT_ID: '/muce-webapp/muce/report/rerun/{0}',
            UPDAET_USER_REPORTS_ORDER: '/muce-webapp/muce/meta/user_report',
            GET_USER_REPORTS_ORDER: '/muce-webapp/muce/meta/user_reports',
            GET_GROUP_REPORTS_ORDERS_BY_USER: '/muce-webapp/muce/meta/user_reports/{0}'
        };

        function login() {
            var url = window.location.href;
            window.location.href = '/login.html?url=' + url;
        }

        function errorHandler(resp, errorMsgContainer) {
            var updateErrorMsg = function(msg) {
                if (!errorMsgContainer) {
                    $('.global-error-msg strong').html(msg);

                    var posX = ($('.container-fluid').width() - $('.global-error-msg').width()) / 2;
                    $('.global-error-msg').css({
                        'left': parseInt(posX, 10),
                        'top': 100
                    }).show();
                } else {
                    var errorMsg = $('.alert-error', errorMsgContainer);
                    if (!errorMsg.length) {
                        errorMsg = $('<div/>').addClass('alert-error alert');
                        errorMsgContainer.prepend(errorMsg);
                    }

                    errorMsg.html(msg).show();
                }

            }
            switch (resp.status) {
                case 403:
                    login();
                    break;
                case 502:
                    updateErrorMsg('No service');
                default:
                    updateErrorMsg(resp.responseText);
                    break;
            }
        }

        return {
            getLogTypes: function() {
                var deferrd = $.Deferred();

                $.ajax({
                    url: config.GET_LOG_TYPES,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getLogPeriods: function() {
                var deferrd = $.Deferred();

                $.ajax({
                    url: config.GET_LOG_PERIODS,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getProfileById: function(id) {
                var deferrd = $.Deferred();

                $.ajax({
                    url: MuceCom.format(config.GET_PROFILE_BY_ID, id),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getGroupById: function(id) {
                var deferrd = $.Deferred();

                $.ajax({
                    url: MuceCom.format(config.GET_GROUP_BY_ID, id),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getReportById: function(id) {
                var deferrd = $.Deferred();

                $.ajax({
                    url: MuceCom.format(config.GET_REPORT_BY_ID, id),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getProfiles: function() {
                var deferrd = $.Deferred();

                $.ajax({
                    url: config.GET_PROFILES,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            updateProfile: function(data, errorMsgContainer) {
                var deferrd = $.Deferred();

                $.ajax({
                    type: 'post',
                    url: config.UPDATE_PROFILE,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp, errorMsgContainer);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            addProfile: function(data, errorMsgContainer) {
                var deferrd = $.Deferred();

                $.ajax({
                    type: 'put',
                    url: config.ADD_PROFILE,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp, errorMsgContainer);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getGroupsByProfileID: function(id) {
                var deferrd = $.Deferred();

                $.ajax({
                    url: MuceCom.format(config.GET_GROUPS_BY_PROFILE, id),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getReportsByProfileID: function(id) {
                var deferrd = $.Deferred();

                $.ajax({
                    url: MuceCom.format(config.GET_REPORTS_BY_PROFILE, id),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            updateEvent: function(id, data) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'post',
                    url: MuceCom.format(config.UPDATE_EVENT, id),
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            addGroup: function(data, errorMsgContainer) {
                var deferrd = $.Deferred();

                $.ajax({
                    type: 'put',
                    url: config.ADD_GROUP,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp, errorMsgContainer);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            updateGroup: function(data, errorMsgContainer) {
                var deferrd = $.Deferred();

                $.ajax({
                    type: 'post',
                    url: config.UPDATE_GROUP,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp, errorMsgContainer);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            deleteGroup: function(id) {
                var deferrd = $.Deferred();

                $.ajax({
                    type: 'delete',
                    url: MuceCom.format(config.DELETE_GROUP, id),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp, errorMsgContainer);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            updateMetric: function(data, errorMsgContainer) {
                var deferrd = $.Deferred();

                $.ajax({
                    type: 'post',
                    url: config.UPDATE_METRIC,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp, errorMsgContainer);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            updateDimension: function(data, errorMsgContainer) {
                var deferrd = $.Deferred();

                $.ajax({
                    type: 'post',
                    url: config.UPDATE_DIMENSION,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp, errorMsgContainer);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },


            addReport: function(data, errorMsgContainer) {
                var deferrd = $.Deferred();

                $.ajax({
                    type: 'put',
                    url: config.ADD_REPORT,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp, errorMsgContainer);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            deleteReport: function(id) {
                var deferrd = $.Deferred();

                $.ajax({
                    type: 'delete',
                    url: MuceCom.format(config.DELETE_REPORT, id),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            updateReport: function(data, errorMsgContainer) {
                var deferrd = $.Deferred();

                $.ajax({
                    type: 'post',
                    url: config.UPDATE_REPORT,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp, errorMsgContainer);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            addMetric: function(data, errorMsgContainer) {
                var deferrd = $.Deferred();

                $.ajax({
                    type: 'put',
                    url: config.ADD_METRIC,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp, errorMsgContainer);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            addDimension: function(data, errorMsgContainer) {
                var deferrd = $.Deferred();

                $.ajax({
                    type: 'put',
                    url: config.ADD_DIMENSION,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp, errorMsgContainer);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            deleteMetric: function(id) {
                var deferrd = $.Deferred();

                $.ajax({
                    type: 'delete',
                    url: MuceCom.format(config.DELETE_METRIC, id),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            deleteDimension: function(id) {
                var deferrd = $.Deferred();

                $.ajax({
                    type: 'delete',
                    url: MuceCom.format(config.DELETE_DIMENSION, id),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getUniqFieldsByProfile: function(id) {
                var deferrd = $.Deferred();
                $.ajax({
                    url: MuceCom.format(config.GET_UNIQ_FIELDS, id),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getReportsData: function(id, data) {
                var deferrd = $.Deferred();
                $.ajax({
                    url: MuceCom.format(config.GET_REPORT_DATA, id),
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getMetricsByProfile: function(id) {
                var deferrd = $.Deferred();
                $.ajax({
                    url: MuceCom.format(config.GET_METRICS_BY_PROFILE, id),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getDimensionsByProfile: function(id, metrics) {
                var deferrd = $.Deferred();
                $.ajax({
                    url: MuceCom.format(config.GET_DIMENSIONS_BY_PROFILE, id),
                    data: {
                        'metrics': metrics
                    },
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getEventsByProfile: function(id) {
                var deferrd = $.Deferred();
                $.ajax({
                    url: MuceCom.format(config.GET_EVENTS_BY_PROFILE, id),
                    success: function(resp) {
                        var sortedData = _.sortBy(resp, function(item) {
                            return item.name;
                        });
                        deferrd.resolve(sortedData);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getSubscribeByUser: function(user) {
                var deferrd = $.Deferred();
                $.ajax({
                    url: MuceCom.format(config.GET_SUBSCRIBE_BY_USER, user),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        switch (resp.status) {
                            case 403:
                                login();
                                break;
                        }
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            upsertSubscribe: function(data) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'post',
                    url: config.UPS_SUBSCRIBE,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getFuncs: function() {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'get',
                    url: config.GET_FUNCS,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getUDFs: function(id) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'get',
                    url: MuceCom.format(config.GET_UDFs, id),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getUDFsByProfileAndEvent: function(profileId, eventId) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'get',
                    url: MuceCom.format(config.GET_UDFs_BY_PROFILE_EVENT, profileId, eventId),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            addUDF: function(data, errorMsgContainer) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'put',
                    url: config.ADD_UDF,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp, errorMsgContainer);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            updateUDF: function(data, errorMsgContainer) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'post',
                    url: config.UPDATE_UDF,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp, errorMsgContainer);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            deleteUDF: function(id) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'delete',
                    url: MuceCom.format(config.DELETE_UDF, id),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            addAnnotation: function(data) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: data.type,
                    url: config.ADD_ANNOTATION,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            deleteAnnotation: function(id) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'delete',
                    url: MuceCom.format(config.DELETE_ANNOTATION, id),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getCompareSummary: function(metricId, data) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'get',
                    url: MuceCom.format(config.GET_COMPARE_SUMMARY, metricId),
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getCompareDetail: function(metricId, data) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'get',
                    url: MuceCom.format(config.GET_COMPARE_DETAIL, metricId),
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            putChannels: function(profileId, data) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'put',
                    url: MuceCom.format(config.PUT_CHANNELS, profileId),
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getChannels: function(profileId) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'get',
                    url: MuceCom.format(config.GET_CHANNELS, profileId),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            deleteChannels: function(profileId, data) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'delete',
                    url: MuceCom.format(config.DELETE_CHANNELS, profileId, data),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getDashboardByUser: function(user) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'get',
                    url: MuceCom.format(config.GET_DASHBOARD_BY_USER, user),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            addDashboard: function(data) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'put',
                    url: config.ADD_DASHBOARD,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            deleteDashboard: function(id) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'delete',
                    url: MuceCom.format(config.DELETE_DASHBOARD, id),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            updateDashbaord: function(data) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'post',
                    url: config.UPDATE_DASHBOARD,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            shareDashboard: function(id, data) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'post',
                    url: MuceCom.format(config.SHARE_DASHBOARD, id),
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getWidgetsByDashboard: function(id) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'get',
                    url: MuceCom.format(config.GET_WIDGETS_BY_DASHBOARD, id),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            addWidget: function(data) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'put',
                    url: config.ADD_WIDGET,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            updateWidget: function(data) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'post',
                    url: config.UPDATE_WIDGET,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            deleteWidget: function(id) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'delete',
                    url: MuceCom.format(config.DELETE_WIDGET, id),
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            updateWidgetsPosition: function(data) {

                var deferrd = $.Deferred();
                $.ajax({
                    type: 'post',
                    url: config.UPDATE_WIDGETS_POSITOIN,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getDimensionData: function(profileId, dimensionId, data) {
                var deferrd = $.Deferred();
                $.ajax({
                    url: MuceCom.format(config.GET_DIMENSION_DATA, profileId, dimensionId),
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getMqDataBases: function() {
                var deferrd = $.Deferred();
                $.ajax({
                    url: config.GET_MQ_DATABASES,
                    type: 'get',
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getMqPartitions: function(database, table) {
                var deferrd = $.Deferred();
                $.ajax({
                    url: MuceCom.format(config.GET_MQ_PARTITION, database, table),
                    type: 'get',
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });
                return deferrd.promise();
            },

            getMqSchemas: function(database, table) {
                var deferrd = $.Deferred();
                $.ajax({
                    url: MuceCom.format(config.GET_MQ_SCHEMA, database, table),
                    type: 'get',
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });
                return deferrd.promise();
            },

            putMqJob: function(data, errorMsgContainer) {
                var deferrd = $.Deferred();
                $.ajax({
                    type: 'put',
                    url: config.PUT_MQ_JOB,
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp, errorMsgContainer);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },
            getMqJobStatus: function(jobId) {
                var deferrd = $.Deferred();
                $.ajax({
                    url: MuceCom.format(config.GET_MQ_JOB_STATUS, jobId),
                    type: 'get',
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },
            getMqUserHistory: function(data) {
                var deferrd = $.Deferred();
                $.ajax({
                    url: config.GET_MQ_USER_HISTORY_QUERY,
                    type: 'get',
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getMqJobView: function(id) {
                var deferrd = $.Deferred();
                $.ajax({
                    url: MuceCom.format(config.GET_MQ_JOB_RESULT_VIEW, id),
                    type: 'get',
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getMqResultDownloadSize: function(id) {
                var deferrd = $.Deferred();
                $.ajax({
                    url: MuceCom.format(config.GET_MQ_RESULT_DOWNLOAD_SIZE, id),
                    type: 'get',
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            reRunReport: function(id, data) {
                var deferrd = $.Deferred();
                $.ajax({
                    url: MuceCom.format(config.RE_RUN_REPORT_BY_REPORT_ID, id),
                    type: 'post',
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            updateUserReportOrder: function(data) {
                var deferrd = $.Deferred();
                $.ajax({
                    url: config.UPDAET_USER_REPORTS_ORDER,
                    type: 'post',
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getUserReportOrder: function(data) {
                var deferrd = $.Deferred();
                $.ajax({
                    url: config.GET_USER_REPORTS_ORDER,
                    type: 'get',
                    data: data,
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getGroupReportsOrderByUser: function(user) {
                var deferrd = $.Deferred();
                $.ajax({
                    url: MuceCom.format(config.GET_GROUP_REPORTS_ORDERS_BY_USER, user),
                    type: 'get',
                    success: function(resp) {
                        deferrd.resolve(resp);
                    },
                    error: function(resp) {
                        errorHandler(resp);
                        deferrd.reject(resp);
                    }
                });

                return deferrd.promise();
            },

            getNameFromCookie: function() {
                var cookie = document.cookie;
                var arr = cookie.split('; ');
                var name = "";
                _.each(arr, function(item) {
                    if (item.indexOf('name=') != -1) {
                        name = item.replace('name=', '');
                    }
                });
            }
        }
    }

    var muceData;
    var factory = _.extend(function() {}, {
        getInstance: function() {
            if (!muceData) {
                muceData = new MuceData();
            }
            return muceData;
        }
    });

    return factory.getInstance();
});