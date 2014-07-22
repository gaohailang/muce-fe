define(function() {

    //$scope.groupList, categoryList, eventList, FieldList
    // todo: submit 之前的数据转换(group -> group_id)
    // todo: 对于 periods -> 两个 checkbox -> 一个 model 值
    // todo: 对于 multi-select(列出所有 options etc) widget

    var commentField = {
        key: 'comment',
        attr: {
            'text-area-elastic': true,
            'rows': '4',
            'cols': '50'
        },
        validate: {
            required: true,
            maxlength: 20,
            minlength: 4
        },
        msg: {}
    };

    var groupFields = [{
            label: 'Group Name',
            key: 'name'
        },
        commentField
    ];

    var categoryFields = [{
            label: 'Category Name',
            key: 'name'
        },
        commentField
    ];

    var reportFields = [{
        key: 'group',
        type: 'select',
        options: ['$scope.groupList']
    }, {
        key: 'category',
        type: 'select',
        options: []
    }, {
        key: 'name',
        label: 'Report Name'
    }, {
        type: 'checkbox',
        label: 'Report Periods',
        key: 'periods'
    }];

    var metricFields = [];

    var combined_metricFields = [];

    var dimensionFields = [{
            label: 'Select Field',
            key: 'field',
            type: 'select',
            options: []
        }, {
            key: 'name',
            label: 'Dimension Name'
        }, {
            key: 'type',
            label: 'Dimension Type'
        },
        commentField
    ];

    // Todo: with base tpl for duplicate boilerplate ctrl
    angular.module('muceApp.report.add', [])
        .controller('groupModalCtrl', function($scope) {
            $scope.modalTitle = 'Add Group';
            $scope.formFields = groupFields;
            $scope.formOptions = {
                key: 'form'
            };

            $scope.submitHandler = function() {
                $scope.submittedData = $scope.form;
                $scope.submittedData = null;
                $scope.formData = {};
            };
        })
        .controller('categoryModalCtrl', function($scope) {
            $scope.modalTitle = 'Add Category';
            $scope.formFields = categoryFields;
            $scope.formOptions = {
                key: 'form',
                submitCopy: 'Save'
            };

            $scope.submitHandler = function() {
                $scope.submittedData = $scope.form;
                $scope.submittedData = null;
                $scope.formData = {};
            };
        })
        .controller('dimensionModalCtrl', function($scope) {
            $scope.modalTitle = 'Add Dimension';
            $scope.formFields = dimensionFields;
            $scope.formOptions = {
                key: 'form',
                submitCopy: 'Save'
            };

            $scope.submitHandler = function() {
                $scope.submittedData = $scope.form;
                $scope.submittedData = null;
                $scope.formData = {};
            };
        });
});