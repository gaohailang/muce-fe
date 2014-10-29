define(function() {

    var resModalModule = angular.module('muceApp.report.resModal', []);
    var dataDict = {
        commentField: {
            key: 'comment',
            type: 'textarea',
            attrs: {
                range: '4,30',
                'text-area-elastic': true,
                'rows': '4',
                'cols': '50'
            }
        },
        groupField: {
            key: 'group',
            type: 'select'
        },
        metricTypeField: {
            type: 'select',
            label: 'Metric Type',
            key: 'type',
            optionStr: 'idx as opt for (idx, opt) in options.options',
            options: ['int', 'float', 'percent'],
            attrs: {
                validator: 'required'
            }
        },
        chartOptions: ['Line'],

        // modifyTime, createTime, owner fields for edit mode
        modifyTimeField: {
            key: 'modifyTime',
            label: 'Modified Time',
            attrs: {
                disabled: true
            }
        },
        createTimeField: {
            key: 'createTime',
            label: 'Created Time',
            attrs: {
                disabled: true
            }
        },

        ownerField: {
            key: 'owner',
            label: 'Owner',
            attrs: {
                disabled: true
            }
        }
    };

    var fieldsDict = {
        group: [{
                label: 'Group Name',
                key: 'name',
                attrs: {
                    validator: 'required'
                }
            },
            dataDict.commentField
        ],
        category: [dataDict.groupField, {
                label: 'Category Name',
                key: 'name'
            },
            dataDict.commentField
        ],
        report: [dataDict.groupField, {
                key: 'category',
                type: 'select'
            }, {
                key: 'name',
                label: 'Report Name'
            }, {
                controlTpl: 'report/add_report/period.html',
                label: 'Report Period'
            }, {
                label: 'Default Chart',
                key: 'defaultChart',
                type: 'select',
                options: dataDict.chartOptions,
                optionStr: 'i for i in options.options'
            }, {
                controlHtml: '<div multi-chooser choices-list="metricList"></div>',
                label: 'Metric'
            }, {
                controlTpl: 'report/_validateMetric.html',
                label: '',
                wrapAttr: {
                    style: 'margin-top: -20px'
                }
            }, {
                label: '行列转置',
                controlTpl: 'report/modal/transform-relation.html'
            }, {
                controlTpl: 'report/_validateChainOpt.html',
                label: '',
                wrapAttr: {
                    style: 'margin-top: -20px'
                }
            }, {
                controlHtml: '<div multi-chooser choices-list="dimensionList" ng-show="!formlyData.isChainSupport"></div><span ng-show="formlyData.isChainSupport">设置行列转置后，无法选择</span>',
                label: 'Dimension'
            },
            dataDict.commentField
        ],

        metric: [{
                type: 'select',
                key: 'event',
                label: 'From Event',
                options: []
            }, {
                label: 'Metric Name',
                key: 'name'
            }, {
                label: 'Select Target',
                key: 'target',
                attrs: {
                    'placeholder': '例如 count(*)'
                }
            }, {
                label: 'Where Condition',
                key: 'conditions',
                type: 'textarea',
                attrs: {
                    'placeholder': "(选填) 例 url_normalize like '/explore/%'",
                    validator: 'optional',
                    range: '4,30',
                    'text-area-elastic': true,
                    'rows': '4',
                    'cols': '50'
                }
            }, {
                controlTpl: 'report/_whereConditionTip.html',
                label: '',
                wrapAttr: {
                    style: 'margin-top: -20px'
                }
            },
            dataDict.metricTypeField, dataDict.commentField, {
                referTpl: 'report/add_metric/fileds.html'
            }
        ],
        combinedMetric: [{
                label: 'Metric Name',
                key: 'name'
            }, {
                referTpl: 'report/add_metric/expression.html'
            },
            dataDict.metricTypeField, dataDict.commentField
        ],
        dimension: [{
                label: 'Select Field',
                controlTpl: 'report/add_dimension/fields.html'
            }, {
                key: 'name',
                label: 'Dimension Name'
            }, {
                key: 'type',
                label: 'Dimension Type',
                options: _.db.dimensionTypes,
                optionStr: 'idx as opt for (idx, opt) in options.options'
            },
            dataDict.commentField
        ]
    };

    // specific handler for postData parser
    var submitMap = {
        group: function($scope, apiHelper) {
            var postData = $scope.formlyData;
            if ($scope._data) {
                apiHelper('editGroup', {
                    data: postData
                }).then(function(data) {
                    replaceInCollection($scope.$root.state.groupList, postData, 'id');
                    if ($scope.$root.state.group.id == postData.id) {
                        $scope.$root.state.group = data;
                    }
                    $scope.$close();
                });
            } else {
                apiHelper('addGroup', {
                    data: postData
                }).then(function(data) {
                    try {
                        $scope.$root.state.groupList.push(data);
                    } catch (e) {}
                    $scope.$close();
                });
            }
        },
        category: function($scope, apiHelper) {
            // before send
            var postData = processIdObj($scope.formlyData, 'group');
            if ($scope._data) {
                apiHelper('editCategory', {
                    data: postData
                }).then(function(data) {
                    replaceInCollection($scope.$root.state.categoryList, postData, 'id');
                    $scope.$close();
                });
            } else {
                apiHelper('addCategory', {
                    data: postData
                }).then(function(data) {
                    try {
                        $scope.$root.state.categoryList.push(data);
                    } catch (e) {}
                    $scope.$close();
                });
            }
        },
        report: function($scope, apiHelper, $notice) {
            var postData = _.clone($scope.formlyData);

            /* before send */
            postData.metrics = _.pluck(_.filter($scope.metricList, function(i) {
                return i.selected;
            }), 'id');
            postData.dimensions = _.pluck(_.filter($scope.dimensionList, function(i) {
                return i.selected;
            }), 'id');
            postData.periods = [];
            if (postData.hour) postData.periods.push(1);
            if (postData.day) postData.periods.push(0);
            if (!$scope._data) {
                postData.categoryId = postData.category.id;
            }
            _.each(['group', 'category', 'hour', 'day'], function(i) {
                delete postData[i];
            });
            postData.defaultChart = +postData.defaultChart;
            // 注：所有Dimensions都可以选择，一次只能选3个 ，Metrics 数量应该 <= 10
            // if (postData.dimensions.length > 3) {
            //     $notice.warning('Dimensions, 一次只能选3个');
            // }
            // if (postData.metrics.length > 10) {
            //     $notice.warning('Metrics 数量应该 <= 10');
            // }
            // if (!postData.dimensions || !postData.metrics) $notice.warning('请按照要求填写');
            /* end before send */

            // process chain option
            if (postData.isChainSupport) {
                var _chainArr = [],
                    _tmpOpt;
                _.each(postData.chainSetting, function(val, key) {
                    if (val.enable) {
                        _.each(val, function(v, k) {
                            if (k !== 'enable') {
                                if (v) {
                                    _tmpOpt = {};
                                    _tmpOpt[key] = k;
                                    _chainArr.push(_tmpOpt);
                                }
                            }
                        });
                    }
                });
                postData.transposition = _chainArr;
                console.log(_chainArr);
                postData.dimensions = []; // chain not allow dimensions
            }
            delete postData.chainSetting;
            delete postData.isChainSupport;

            if ($scope._data) {
                apiHelper('editReport', {
                    data: postData
                }).then(function(data) {
                    $scope.$close();
                });
            } else {
                apiHelper('addReport', {
                    data: postData
                }).then(function(data) {
                    // Todo 区分 add/edit 的后续处理
                    // Todo: 被添加的category 和 currentCategory 是一致的
                    try {
                        if ($scope.$root.state.category.id === postData.categoryId) {
                            $scope.$root.state.reportList.push(data);
                        }
                    } catch (e) {}
                    $scope.$close();
                });
            }

        },
        metric: function($scope, apiHelper) {
            var postData = _.clone($scope.formlyData);
            postData.type = +(postData.type);
            if ($scope._data) {
                postData.eventId = postData.event.id;
                delete postData.event;
                apiHelper('editMetric', {
                    data: postData
                }).then(function(data) {
                    replaceInCollection($scope.metricList, postData, 'id');
                    $scope.$emit('report:editMetric', data);
                    $scope.$close();
                });
            } else {
                apiHelper('addMetric', {
                    data: processIdObj(postData, 'event')
                }).then(function(retMetric) {
                    $scope.$emit('report:addMetric', retMetric);
                    $scope.$close();
                });
            }
        },
        combinedMetric: function($scope, apiHelper) {
            var postData = _.clone($scope.formlyData);
            $scope.expressionErr = '';
            if ($scope._data) {
                // process data
                apiHelper('editCombineMetric', {
                    data: postData
                }).then(function(_ret) {
                    $scope.$emit('report:editMetric', _ret);
                    $scope.$close();
                });
            } else {
                if (postData.metricId1 && postData.metricId2 && postData.operator) {
                    apiHelper('addCombineMetric', {
                        data: postData
                    }).then(function(data) {
                        $scope.$emit('report:addMetric', data);
                        $scope.$close();
                    });
                } else {
                    $scope.expressionErr = '请先填写表达式';
                }
            }
        },
        dimension: function($scope, apiHelper) {
            var postData = processIdObj($scope.formlyData, 'field');
            postData.fieldIds = postData.fieldId;
            delete postData.fieldId;
            if ($scope._data) {
                apiHelper('editDimension', {
                    data: postData
                }).then(function(data) {
                    replaceInCollection($scope.dimensionList, postData, 'id');
                    $scope.$emit('report:editDimension', data);
                    $scope.$close();
                });
            } else {
                apiHelper('addDimension', {
                    data: postData
                }).then(function(retDimen) {
                    console.log(retDimen);
                    // diff res fields with management page
                    $scope.$emit('report:addDimension', retDimen);
                    $scope.$close();
                });
            }
        }
    };

    // specific handler for init res modal
    var initMap = {
        group: function($scope) {
            if ($scope._data) {
                $scope.formlyData = $scope._data;
            }
        },
        category: function($scope, apiHelper) {
            apiHelper('getGroupList').then(function(data) {
                $scope.formFields[0].options = data;

                if ($scope._data) {
                    // edit mode
                    $scope.formlyData = $scope._data;
                    $scope.formlyData.group = _.find($scope.$root.state.groupList, function(i) {
                        return i.id === $scope._data.groupId;
                    });
                } else {
                    // hack for ng-options var reset
                    $scope.formlyData.group = _.find(data, function(i) {
                        return i.id === $scope.$root.state.group.id;
                    });
                }
            });
        },
        report: function($scope, apiHelper, $timeout) {
            if ($scope._data) {
                $scope.formlyData = $scope._data;
                $scope.formlyData.day = true;
                $scope.formlyData.defaultChart = '0';
                if ($scope._data.transposition && $scope._data.transposition.length) {
                    $scope.formlyData.isChainSupport = true;
                    // dateType, metricType
                    $scope.formlyData.chainSetting = {};
                    _.each($scope._data.transposition, function(i) {
                        var _key = _.keys(i)[0];
                        var _val = _.values(i)[0];
                        if (!$scope.formlyData.chainSetting[_key]) {
                            $scope.formlyData.chainSetting[_key] = {};
                        }
                        $scope.formlyData.chainSetting[_key].enable = true;
                        $scope.formlyData.chainSetting[_key][_val] = true;
                    });
                }
                // Todo~~
            } else {
                $scope.formlyData.day = true;
                $scope.formlyData.defaultChart = '0';
            }

            $timeout(function() {
                apiHelper('getGroupList').then(function(data) {
                    $scope.formFields[0].options = data;
                    if (!$scope._data) {
                        if ($scope.$root.state && $scope.$root.state.group) {
                            $scope.formlyData.group = _.find(data, function(i) {
                                return i.id === $scope.$root.state.group.id;
                            });
                        } else {
                            $scope.formlyData.group = data[0];
                        }
                    }
                });

                apiHelper('getMetricList').then(function(data) {
                    $scope.metricList = data;
                    if ($scope._data) {
                        _.each($scope._data.metrics, function(i) {
                            _.each($scope.metricList, function(_i) {
                                if (i.id === _i.id) {
                                    _i.selected = true;
                                }
                            })
                        });
                    }
                });

                apiHelper('getDimensionList').then(function(data) {
                    $scope.dimensionList = data;
                    if ($scope._data) {
                        _.each($scope._data.dimensions, function(i) {
                            _.each($scope.dimensionList, function(_i) {
                                if (i.id === _i.id) {
                                    _i.selected = true;
                                }
                            })
                        });
                    }
                });
            });

            // chain option related
            $scope.chainTypes = [{
                alias: '昨天',
                name: 'YESTERDAY'
            }, {
                alias: '上周',
                name: 'LAST_WEEK'
            }, {
                alias: '上月',
                name: 'LAST_MONTH'
            }];

            $scope.$watch('formlyData.group', function(val) {
                if (!val) return;
                apiHelper('getCategoryList', {
                    params: {
                        groupId: val.id
                    }
                }).then(function(data) {
                    $scope.formFields[1].options = data;
                    if ($scope.$root.state && $scope.$root.state.group && (val.id === $scope.$root.state.group.id)) {
                        $scope.formlyData.category = _.find(data, function(i) {
                            return i.id === $scope.$root.state.category.id;
                        });
                    } else {
                        $scope.formlyData.category = data[0];
                    }

                });
            }, true);

            $scope.$watch('metricList', function(val, old) {
                // update shadow validtor ngmodel
                if (!val || !old) return;
                $scope._validateMetric = new Date().getTime();
            }, true);

            $scope.$watch('dimensionList', function(val, old) {
                // update shadow validtor ngmodel
                if (!val || !old) return;
                $scope._validateDimension = new Date().getTime();
            }, true);
        },
        metric: function($scope, apiHelper) {
            apiHelper('getEventList').then(function(data) {
                $scope.formFields[0].options = data;
                if ($scope._data) {
                    $scope.formlyData = $scope._data;
                    $scope.formlyData.event = _.find(data, function(i) {
                        return i.id === $scope.formlyData.eventId;
                    });
                } else {
                    $scope.formlyData.event = data[0];
                    $scope.formlyData.type = '0';
                }
            });

            // watch event to fetch optional fields
            $scope.$watch('formlyData.event', function(val) {
                if (!val) return;
                apiHelper('getFieldList', {
                    params: {
                        eventId: val.id
                    }
                }).then(function(data) {
                    $scope.optionalFileds = data;
                });
            }, true);
        },
        combinedMetric: function($scope, apiHelper) {
            $scope.metricOperators = _.db.metricOperators;
            apiHelper('getMetricList').then(function(data) {
                $scope.metricList = data;
                if ($scope._data) {
                    $scope.formlyData = $scope._data;
                    $scope.formlyData.type = '' + $scope.formlyData.type;
                    // Todo 找不到~ metricId1(变化过的)
                    $scope.formlyData.metricId1 = _.find(data, function(i) {
                        return i.id == $scope.formlyData.metricId1;
                    }).id;
                    $scope.formlyData.metricId2 = _.find(data, function(i) {
                        return i.id == $scope.formlyData.metricId2;
                    }).id;
                } else {
                    $scope.formlyData.type = '0';
                }
            });
        },
        dimension: function($scope, apiHelper) {
            apiHelper('getFieldIdList').then(function(data) {
                data = transFieldIds(data);
                $scope.formFields[0].options = data;

                if ($scope._data) {
                    $scope.formlyData = $scope._data;
                    // Todo: dataType, fields bug
                    $scope.formlyData.field = _.find(data, function(i) {
                        return i.name == $scope._data.fieldName;
                    });
                } else {
                    $scope.formlyData.field = data[0];
                    $scope.formlyData.type = '0';
                }
            });
        }
    };

    function transFieldIds(data) {
        return _.map(data, function(val, key) {
            return {
                name: key,
                id: val
            };
        });
    }

    function replaceInCollection(collection, item, identitier) {
        _.each(collection, function(i, idx) {
            if (i[identitier] === item[identitier]) {
                collection[idx] = item;
            }
        });
    }

    _.each(fieldsDict, function(formFields, key) {
        resModalModule.controller(key + 'ModalCtrl', ['$scope', 'apiHelper', '$notice', '$rootScope', '$filter', '$timeout',
            function($scope, apiHelper, $notice, $rootScope, $filter, $timeout) {
                var prefix = $scope._data ? 'Edit ' : 'Add ';
                $scope.modalTitle = prefix + _.capitalize(key);
                _formFields = angular.copy(formFields);
                // Todo: check _data eidt with edit field
                if ($scope._data) {
                    // adjust timestamp for _data
                    _.each(['modifyTime', 'createTime'], function(_tkey) {
                        $scope._data[_tkey] = $filter('date')($scope._data[_tkey], 'yyyy-MM-dd mm:ss');
                    });

                    // case for metric(whicih has event field huge table)
                    if (key === 'metric') {
                        _formFields.splice((_formFields.length - 1), 2, dataDict.ownerField, dataDict.createTimeField, dataDict.modifyTimeField);
                        _formFields = _.uniq(_formFields, function(f) {
                            return f.key;
                        });
                    } else {
                        _formFields = _formFields.concat([dataDict.ownerField, dataDict.createTimeField, dataDict.modifyTimeField]);
                    }

                    if (key === 'category') {
                        // category.group readable
                        _formFields[0].attrs = {
                            disabled: true
                        };
                    }
                    if (key === 'report') {
                        // report.group, category remove
                        _formFields.splice(0, 2);
                    }

                    // if metric disable tab change~~
                }
                $scope.formFields = _formFields;

                $scope.formName = 'formly';
                $scope.formlyData = {};

                initMap[key]($scope, apiHelper, $timeout);
                $scope.submit = function() {
                    console.log($scope.formlyData);
                    submitMap[key]($scope, apiHelper, $notice);
                };
            }
        ]);
    });

    resModalModule.controller('metricModalWrapperCtrl', function($scope) {
        $scope.toggleMetricTypeTab = function(type) {
            $scope.$root.currentMetricTab = type;
        };

        $scope.checkViewStats = function(type) {
            if ($scope._data) {
                if ($scope._data.metricType == 'COMBINE') {
                    $scope.$root.currentMetricTab = 'combine_metric';
                } else {
                    $scope.$root.currentMetricTab = 'normal_metric';
                }
                if ($scope.$root.currentMetricTab == type) {
                    return true;
                } else {
                    return false;
                }
            }
            return true;
        };
    });

    resModalModule.config(function($validationProvider) {
        // 第一次如何 trigger(onSubmit)
        $validationProvider.setExpression({
            chainOptConstraint: function(val, scope, element, attrs) {
                var _formScope = element.scope().formlyData;
                if (!_formScope.isChainSupport) return true;
                console.log(arguments);
                if (!_formScope.chainSetting) return false;
                var _validate = false;
                _validate = _.every(_formScope.chainSetting, function(val, key) {
                    if (val.enable) {
                        return val.SUBTRACT || val.DIVIDE;
                    } else {
                        return true;
                    }
                    // 整理数据给后端 at here
                });
                return _validate;
            },
            periodChooser: function(value, scope, element, attrs) {
                var form = element.scope().formlyData;
                if (form.day || form.hour) {
                    return true;
                }
                return false;
            },
            multiChooseChecker: function(val, scope, element, attrs) {
                var x = _.filter(element.scope()[attrs.key], function(i) {
                    return i.selected;
                });
                return (x.length < attrs.lt && x.length > attrs.gt);
            }
        }).setDefaultMsg({
            periodChooser: {
                error: 'Please check period at least one', // Todo: msg from attr info
                success: ''
            },
            multiChooseChecker: {
                error: 'Please choose correct number items'
            },
            chainOptConstraint: {
                error: 'Please choose correct comparsion type',
                success: ''
            }
        });
    });

    /* utilities */
    function processIdObj(formData, key) {
        var clone = _.clone(formData);
        if (_.isString(key)) {
            key = [key];
        }
        _.each(key, function(_key) {
            clone[_key + 'Id'] = clone[_key].id;
            delete clone[_key];
        });
        return clone;
    }
});