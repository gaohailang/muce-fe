define(['base/muceCom'], function(muceCom) {

    function navbarDef() {
        return {
            link: function($scope, $elem, $attr) {
                // filter events, metrics for navbar
                $scope.navs = _.without(muceCom.moduleList, 'events', 'metrics');
            }
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

    angular.module('muceApp.base.directives', [])
        .directive('muceNavbar', navbarDef)
        .directive('muceInclude', ['$http', '$templateCache', '$compile', muceInclude]);
});