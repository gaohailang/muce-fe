define(function() {

    //$scope.groupList, categoryList, eventList, FieldList
    // todo: 对于 multi-select(列出所有 options etc) widget
    // todo: 如何设置 options 的值为 deferred 对象
    // todo: dataDict 中的 option 的默认值
    // todo: add category, 默认的当前的 group report etc
    // done: 默认全是 required 的
    // todo: 给外围 referTpl 设定 validator?
    var addModule = angular.module('muceApp.report.add', []);
    var dataDict = {
        commentField: {
            key: 'comment',
            type: 'textarea',
            attrs: {
                // validator: 'required,lengthRange',
                validator: 'optional',
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
            optionStr: '$index as opt for opt in options.options',
            options: ['int', 'float', 'percent'],
            attrs: {
                validator: 'required'
            }
        }
    };

    var fieldsDict = {
        group: [{
                label: 'Group Name',
                key: 'name',
                attrs: {
                    validator: 'required'
                    // requiredErrorMessage: '测试错误',
                    // requiredSuccessMessage: '测试正确输入'
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
                controlHtml: '<div multi-chooser choices-list="metricList"></div>',
                label: 'Metric'
            }, {
                controlHtml: '<div multi-chooser choices-list="dimensionList"></div>',
                label: 'Dimension'
            },
            dataDict.commentField, {
                key: 'isEnable',
                type: 'checkbox'
            }
        ],
        metric: [{
                type: 'select',
                key: 'event',
                label: 'Select Event',
                options: []
            }, {
                controlTpl: 'report/add_metric/fileds.html',
                label: 'Optional Fields'
            }, {
                label: 'Metric Name',
                key: 'name'
            }, {
                label: 'Metric Expression',
                key: 'expression',
                type: 'textarea',
                attrs: {
                    'text-area-elastic': true,
                    'rows': '4',
                    'cols': '50'
                }
            },
            dataDict.metricTypeField, dataDict.commentField
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
                optionStr: 'opt for opt in options.options'
            },
            dataDict.commentField
        ]
    };

    // specific handler for postdata parser
    var addOkMap = {
        group: function($scope, apiHelper) {
            // this equal $scope
            apiHelper('addGroup', {
                data: processIdObj($scope.formlyData)
            }).then(function() {
                $scope.$close();
            });
        },
        category: function($scope, apiHelper) {
            apiHelper('addCategory', {
                data: processIdObj($scope.formlyData)
            }).then(function() {
                $scope.$close();
            });
        },
        report: function($scope, apiHelper) {
            var postData = _.clone($scope.formlyData);
            postData.metrics = _.map(_.filter($scope.metricList, function(i) {
                return i.selected;
            }), function(x) {
                return [x.id, x.type].join(',');
            });
            postData.dimensions = _.pluck($scope.dimensionList, 'id');
            postData.periods = [];
            if (postData.hour) postData.periods.push(1);
            if (postData.day) postData.periods.push(0);
            postData.categoryId = postData.category.id;
            _.each(['group', 'category', 'hour', 'day'], function(i) {
                delete postData[i];
            });
            apiHelper('addReport', {
                data: postData
            }).then(function() {
                $scope.$close();
            });
        },
        metric: function($scope, apiHelper) {

        },
        combinedMetric: function($scope, apiHelper) {
            var postData = _.clone($scope.formlyData);
            if (postData.metricId1 && postData.metricId2 && postData.operator) {
                apiHelper('addCombineMetric', {
                    data: postData
                }).then(function() {
                    $scope.$close();
                });
            } else {
                $scope.expressionErr = '请先填写表达式';
            }
        },
        dimension: function($scope, apiHelper) {

        }
    };

    // specific handler for init add modal
    var initMap = {
        group: function() {},
        category: function($scope, apiHelper) {
            apiHelper('getGroupList').then(function(data) {
                $scope.formlyData.group = data[0];
                $scope.formFields[0].options = data;
            });
        },
        report: function($scope, apiHelper) {
            apiHelper('getGroupList').then(function(data) {
                $scope.formlyData.group = data[0];
                $scope.formFields[0].options = data;
            });
            apiHelper('getMetricList').then(function(data) {
                $scope.metricList = data;
            });
            apiHelper('getDimensionList').then(function(data) {
                $scope.dimensionList = data;
            });
            $scope.$watch('formlyData.group', function(val) {
                if (!val) return;
                apiHelper('getCategoryList', {
                    params: {
                        groupId: val.id
                    }
                }).then(function(data) {
                    $scope.formlyData.category = data[0];
                    $scope.formFields[1].options = data;
                });
            }, true);
        },
        metric: function($scope, apiHelper) {
            $scope.$root.currentMetricTab = 'normal_metric';
            apiHelper('getEventList').then(function(data) {
                $scope.formFields[0].options = data;
                $scope.formlyData.event = data[0];
            });

            // watch event to fetch optional fields
            $scope.$watch('formlyData.event', function(val) {
                if (!val) return;
                apiHelper('getFieldList', {
                    params: {
                        eventId: val.id
                    }
                }).then(function(data) {
                    console.log(data); // set $scope.form.xx bug!!
                    $scope.optionalFileds = data;
                });
            }, true);
        },
        combinedMetric: function($scope, apiHelper) {
            $scope.$root.currentMetricTab = 'combine_metric';
            $scope.formlyData.type = 0;
            apiHelper('getMetricList').then(function(data) {
                $scope.metricList = data;
            });
            $scope.metricOperators = _.db.metricOperators;
        },
        dimension: function($scope, apiHelper) {
            apiHelper('getFieldList').then(function(data) {
                $scope.formFields[0].options = data;
                $scope.formlyData.field = data[0];
            });
        }
    };

    // Todo: with base tpl for duplicate boilerplate ctrl
    _.each(fieldsDict, function(formFields, key) {
        addModule.controller(key + 'ModalCtrl', function($scope, apiHelper) {
            $scope.modalTitle = 'Add ' + _.capitalize(key);
            $scope.formFields = formFields;
            // $scope.formName = key;
            // $scope[key + 'Data'] = {};
            $scope.formName = 'formly';
            $scope.formlyData = {};

            initMap[key]($scope, apiHelper);
            $scope.ok = function() {
                console.log($scope.formlyData);
                addOkMap[key]($scope, apiHelper);
            };
        });
    });

    addModule.config(function($validationProvider) {
        // 第一次如何 trigger(onSubmit)
        $validationProvider.setExpression({
            periodChooser: function(value, scope, element, attrs) {
                var form = element.scope().formlyData;
                if (form.day || form.hour) {
                    return true;
                }
                return false;
            }
        }).setDefaultMsg({
            periodChooser: {
                error: '至少选一个吧', // Todo: msg from attr info
                success: ''
            }
        });
    });

    /* utilities */
    function processIdObj(formData) {
        var clone = formData;
        _.each(clone, function(val, key) {
            if (['group'].indexOf(key) > -1) {
                delete clone[key];
                clone[key + 'Id'] = val.id;
            }
            // field 检查， 数组类型拼接
            // type indexOf dimensionTypes
        });
        return clone;
    }
});