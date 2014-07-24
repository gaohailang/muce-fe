define(function() {

    //$scope.groupList, categoryList, eventList, FieldList
    // todo: submit 之前的数据转换(group -> group_id)
    // todo: 对于 multi-select(列出所有 options etc) widget
    // todo: 如何设置 options 的值为 deferred 对象
    // todo: dataDict 中的 option 的默认值
    // todo: add category, 默认的当前的 group report etc
    // done: 默认全是 required 的
    // todo: 给外围 referTpl 设定 validator?
    var addModule = angular.module('muceApp.report.add', []);
    var dataDict = {
        dimensionTypes: ['string', 'int', 'float', 'percent'],
        metricOperators: ['+', '-', '*', '/'],
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
            optionStr: 'opt for opt in options.options',
            options: ['int', 'float', 'percent'],
            attrs: {
                'ng-value': "'percent'"
            }
        }
    };

    var fieldsDict = {
        group: [{
                label: 'Group Name',
                key: 'name',
                attrs: {
                    validator: 'required',
                    requiredErrorMessage: '测试错误',
                    requiredSuccessMessage: '测试正确输入'
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
                referTpl: 'report/add_report/period.html'
            }, {
                referTpl: 'report/add_report/metric.html'
            }, {
                referTpl: 'report/add_report/dimension.html'
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
                label: 'Optional Fields',
                key: 'x',
                type: 'textarea'
            }, {
                label: 'Metric Name',
                key: 'name'
            }, {
                label: 'Metric Expression',
                key: 'expression',
                type: 'textarea'
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
                key: 'field',
                type: 'select',
                options: []
            }, {
                key: 'name',
                label: 'Dimension Name'
            }, {
                key: 'type',
                label: 'Dimension Type',
                options: dataDict.dimensionTypes,
                optionStr: 'opt for opt in options.options'
            },
            dataDict.commentField
        ]
    };

    var addOkMap = {
        group: function() {
            // this equal $scope
            console.log();
        },
        category: function() {
            console.log()
        },

        report: function() {
            // [metricList. dimensionList] array,with selected
            // formlyData[comment, group[id], isEnable, name]
            // todo: 对于 periods -> 两个 checkbox -> 一个 model 值
        }
    };

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
            // update category list -
            // when user change select at modal form
            $scope.$watch('formlyData.group', function(val) {
                if (!val) return;
                apiHelper('getCategoryList', {
                    params: {
                        group_id: val.id
                    }
                }).then(function(data) {
                    $scope.formlyData.category = data[0];
                    $scope.formFields[1].options = data;
                });
            }, true);
        },
        metric: function($scope, apiHelper) {
            apiHelper('getEventList').then(function(data) {
                $scope.formFields[0].options = data;
                $scope.formlyData.event = data[0];
            });

            // watch event to fetch optional fields
            $scope.$watch('form.event', function(val) {
                if (!val) return;
                apiHelper('getFieldList', {
                    params: {
                        event_id: val.id
                    }
                }).then(function(data) {
                    console.log(data); // set $scope.form.xx bug!!
                    $scope.formlyData.x = _.pluck(data, 'name').join(',');
                });
            }, true);
        },
        combinedMetric: function($scope, apiHelper) {
            apiHelper('getMetricList').then(function(data) {
                $scope.metricList = data;
            });
            $scope.metricOperators = dataDict.metricOperators;
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
                // _.bind(addOkMap[key], $scope).call();
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

});