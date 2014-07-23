define(['base/muceCom'], function(muceCom) {

    function navbarDef() {
        return function(scope, elem, attr) {
            // filter events, metrics for navbar
            scope.navs = _.without(muceCom.moduleList, 'events', 'metrics');
        }
    }

    function muceInclude($http, $templateCache, $compile) {
        // quick fix for ng-include without create a new scope
        // let you quick move popup etc into separate file
        return function(scope, element, attrs) {
            var templatePath = attrs.muceInclude;
            $http.get(templatePath, {
                cache: $templateCache
            }).success(function(response) {
                var contents = element.html(response).contents();
                $compile(contents)(scope);
            });
        };
    }

    function dateTimePickerLinker($scope, $elem, $attr, ngModelCtrl) {
        if (!$.fn.datetimepicker) return;
        ngModelCtrl.$formatters.unshift(function(valueFromModel) {
            // return how data will be shown in input
            if (!valueFromModel) return;
            return new Date(valueFromModel).dateFormat('Y/m/d');
        });

        ngModelCtrl.$parsers.push(function(valueFromInput) {
            // return how data should be stored in model
            return new Date(valueFromInput).getTime();
        });
        var diyOptions = $scope.$eval($attr.picker);

        var options = _.extend({
            // lang: 'zh',
            format: 'Y/m/d',
            defaultSelect: false,
            scrollInput: true,
            timepicker: false,
            // i18n: {
            //     zh: {
            //         months: [
            //             '一月', '二月', '三月', '四月',
            //             '五月', '六月', '七月', '八月',
            //             '九月', '十月', '十一月', '十二月'
            //         ],
            //         dayOfWeek: [
            //             '星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'
            //         ]
            //     }
            // },
            yearStart: 2010,
            yearEnd: 2016
        }, diyOptions, {
            onChangeDateTime: function(dp, $input) {
                if (diyOptions && diyOptions.onChangeDateTime) {
                    diyOptions.onChangeDateTime.call(this, dp);
                }
                ngModelCtrl.$setViewValue($input.val());
            }
        });
        $elem.datetimepicker(options);
    }

    angular.module('muceApp.base.directives', [])
        .directive('muceNavbar', navbarDef)
        .directive('muceInclude', ['$http', '$templateCache', '$compile', muceInclude])
        .directive('dateTimePicker', function() {
            return {
                require: '?ngModel',
                link: dateTimePickerLinker
            };
        });
});