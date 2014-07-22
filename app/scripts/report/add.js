define(function() {

    //$scope.groupList, categoryList, eventList, FieldList
    // todo: submit 之前的数据转换(group -> group_id)
    // todo: 对于 periods -> 两个 checkbox -> 一个 model 值
    // todo: 对于 multi-select(列出所有 options etc) widget
    // todo: 如何设置 options 的值为 deferred 对象

    var dataDict = {
        dimensionTypes: ['string', 'int', 'float', 'percent'],
        metricOperators: ['+', '-', '*', '/'],
        commentField: {
            key: 'comment',
            attr: {
                'text-area-elastic': true,
                'rows': '4',
                'cols': '50'
            },
            type: 'textarea',
            validate: {
                required: true,
                maxlength: 20,
                minlength: 4
            },
            msg: {}
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
            options: ['int', 'float', 'percent']
        }
    };

    var fieldsDict = {
        group: [{
                label: 'Group Name',
                key: 'name'
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
        dimension: [dataDict.groupField, {
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

    var metricFields = [];

    var combined_metricFields = [];


    // Todo: with base tpl for duplicate boilerplate ctrl
    angular.module('muceApp.report.add', [])
        .controller('groupModalCtrl', function($scope) {
            $scope.modalTitle = 'Add Group';
            $scope.formFields = fieldsDict.group;
            $scope.formOptions = {
                key: 'form'
            };

            $scope.submitHandler = function() {
                $scope.submittedData = $scope.form;
                $scope.submittedData = null;
                $scope.formData = {};
            };
        })
        .controller('categoryModalCtrl', function($scope, apiHelper) {
            $scope.form = {}; // no need to prefill group: $scope.currentGroup
            $scope.modalTitle = 'Add Category';
            $scope.formFields = fieldsDict.category;
            $scope.formOptions = {
                key: 'form'
            };
            apiHelper('getGroupList').then(function(data) {
                $scope.form.group = data[0];
                $scope.formFields[0].options = data;
            });

            $scope.submitHandler = function() {
                $scope.submittedData = $scope.form;
                $scope.submittedData = null;
                $scope.formData = {};
            };
        })
        .controller('reportModalCtrl', function($scope, apiHelper) {
            $scope.form = {};
            $scope.formOptions = {
                key: 'form'
            };
            $scope.modalTitle = 'Add Report';
            $scope.formFields = fieldsDict.report;
            apiHelper('getGroupList').then(function(data) {
                $scope.form.group = data[0];
                $scope.formFields[0].options = data;
            });

            // update category list -
            // when user change select at modal form
            $scope.$watch('form.group', function(val) {
                if (!val) return;
                apiHelper('getCategoryList', {
                    params: {
                        group_id: val.id
                    }
                }).then(function(data) {
                    $scope.formFields[1].options = data;
                    $scope.form.category = data[0];
                });
            }, true);
        })
        .controller('metricModalCtrl', function($scope, apiHelper) {
            $scope.form = {};
            $scope.formOptions = {
                key: 'form'
            };
            $scope.modalTitle = 'Add Metric';
            $scope.formFields = fieldsDict.metric;
            apiHelper('getEventList').then(function(data) {
                $scope.formFields[0].options = data;
                $scope.form.event = data[0];
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
                    $scope.form.x = _.pluck(data, 'name').join(',');
                });
            }, true);
        })
        .controller('combineMetricModalCtrl', function($scope, apiHelper) {
            $scope.form = {};
            $scope.formOptions = {
                key: 'form'
            };
            $scope.modalTitle = 'Add Metric';
            $scope.formFields = fieldsDict.combinedMetric;
            apiHelper('getMetricList').then(function(data) {
                $scope.metricList = data;
            });
            $scope.metricOperators = dataDict.metricOperators;
        })
        .controller('dimensionModalCtrl', function($scope, apiHelper) {
            $scope.form = {};
            $scope.formOptions = {
                key: 'form'
            };
            $scope.modalTitle = 'Add Dimension';
            $scope.formFields = fieldsDict.dimension;
            apiHelper('getFieldList').then(function(data) {
                $scope.formFields[0].options = data;
            });

            $scope.submitHandler = function() {
                $scope.submittedData = $scope.form;
                // { "name": "age", "type": 3, "field": "age", "comment": "年龄"}
                apiHelper('addDimension', {

                }).then(function(data) {

                });
                $scope.submittedData = null;
            };
        });
});