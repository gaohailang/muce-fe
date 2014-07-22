define(function() {
    'use strict';

    /*
        JSON powered forms
        AngularJS directive which takes JSON representing a form and renders to HTML
        // http://gaohailang.github.io/angular-formly/#!/
        // validation - https://github.com/huei90/angular-validation
        first version - http: //gaohailang.github.io/angular-formly/#!/
        Todo: extend it with < angular - validation > inspiration

        // validate showcase
        // plugin showcase - text-area-elastic
        // referTp showcase - hook for diy-style, dynamic and rich field widget
    */

    function formlyField($http, $compile, $templateCache) {

        function getTemplateUrl(type) {
            // Todo More Input Type Widget
            var templateUrl = 'templates/widgets/formly-field.html';
            return templateUrl;
        }

        function notFoundTypeTpl(type) {
            console.log('Formly Error: template type \'' + type + '\' not supported.');
        }

        /*
            placeholder 可以 false掉或者over written, 默认是 label 值
            label 默认是 key 的slugify值
            options 和 type=select 是重复的？
        */
        return {
            restrict: 'AE',
            replace: true,
            scope: false,
            link: function fieldLink($scope, $element, $attr) {
                $scope.options = $scope.$eval($attr.options);

                // shortcut for hook referTpl
                if ($scope.options.referTpl) {
                    $element.html(document.querySelector($scope.options.referTpl).innerHTML);
                    $compile($element.contents())($scope);
                    return;
                }

                if (!$scope.options.label) {
                    $scope.options.label = $scope.options.key;
                }
                if ($scope.options.options) {
                    $scope.options.type = 'select';
                }

                var templateUrl = getTemplateUrl($scope.options.type);
                if (!templateUrl) return notFoundTypeTpl($scope.options.type);

                var $input, $msg;
                $http.get(templateUrl, {
                    cache: $templateCache
                }).success(function(data) {
                    $element.html(data);

                    // $input = $element.find($scope.options.type)[0] ? $element.find($scope.options.type)[0] : $element.find('input')[0]; // campatible with default option
                    // $msg = $element.find('div')[1];

                    $input = $element.find('input')[0];
                    $input.setAttribute('ng-model', $scope.$parent.options.key + '.' + $scope.options.key);
                    $input.setAttribute('name', $scope.options.key);
                    if ($input && $scope.options.validate) {
                        angular.forEach($scope.options.validate, function(val, key) {
                            $input.setAttribute('ng-' + key, val);
                        });
                    }
                    // if ($msg && $scope.options.msg) {
                    //     angular.forEach($scope.options.msg, function(val, key) {
                    //         $msg.setAttribute(key, val);
                    //     });
                    // }
                    if ($input && $scope.options.attr) {
                        angular.forEach($scope.options.attr, function(val, key) {
                            $input.setAttribute(key, val);
                        });
                    }
                    $compile($element.contents())($scope);
                });
            },
            controller: function fieldController($scope) {
                return;
                $scope.options = $scope.optionsData();
                if ($scope.options.
                    default) {
                    $scope.value = $scope.options.
                    default;
                }

                // set field id to link labels and fields
                $scope.id = $scope.options.key;
            }
        };
    }

    function formlyForm($compile) {
        return {
            restrict: 'AE',
            templateUrl: 'templates/widgets/formly-form.html',
            replace: true,
            scope: true,
            link: function($scope, $elem, $attr) {
                $scope.options = $scope.$eval($attr.options);
                $scope.fields = $scope.$eval($attr.fields);
                $scope.$parent[$scope.options.key] = {};
                // $elem[0].setAttribute('name', $scope.options.key);
                $compile($elem.contents())($scope);
            }
        };
    }

    angular.module('muceApp.base.services.formly', [])
        .directive('formlyField', formlyField)
        .directive('formlyForm', formlyForm);
});