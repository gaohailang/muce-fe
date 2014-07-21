define(function() {
    /*
        JSON powered forms
        AngularJS directive which takes JSON representing a form and renders to HTML
    */
    // http://gaohailang.github.io/angular-formly/#!/
    // validation - https://github.com/huei90/angular-validation

    /*
    first version - http://gaohailang.github.io/angular-formly/#!/
    Todo: extend it with <angular-validation> inspiration

    // validate showcase
    var emailField = {
        label: '电子邮箱',
        key: 'email',
        type: 'email',
        placeholder: 'janedoe@gmail.com',
        defaultVal: 'ghld@126.com',
        validate: {
            required: true,
            maxlength: 10
            // pattern: '/^[\\d]*@\\.$/'
        },
        msg: {
            help: '这里是普通的help文档',
            xrequired: '必填项',
            maxlength: '最长长度超过了',
            pattern: 'pattern不正确'
        },
        attr: {
            'dynamicAttr': 'value-for'
        }
    };

    // plugin showcase - text-area-elastic
    var textareaField = {
        label: 'textarea控件',
        key: 'textarea',
        type: 'textarea',
        attr: {
            'text-area-elastic': true,
            'rows': '4',
            'cols': '50'
        }
    };

    var selectField = {
        type: 'select',
        label: 'select控件',
        key: 'vehicle',
        info: '请选择交通工具',
        options: [{
            name: 'Car',
            value: 'car',
            group: 'inefficiently'
        }, , , ]
    };

    // referTp showcase - hook for diy-style, dynamic and rich field widget
    $scope.formFields = [emailField, textareaField, selectField, {
        referTpl: '#input-extra-uploader'
    }, {
        type: 'password',
        label: 'Password',
        key: 'password'
    }, {
        type: 'checkbox',
        label: 'Check this here',
        key: 'checkbox1'
    }, {
        type: 'hidden',
        default: 'secret_code',
        key: 'secretCode'
    }];

    $scope.formOptions = {
        key: 'autoNgform',
        submitCopy: 'Save'
    };

    */
});