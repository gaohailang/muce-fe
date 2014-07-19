define(['base/muceCom'], function(muceCom) {

    function navbarDef() {
        return {
            link: function($scope, $elem, $attr) {
                // filter events, metrics for navbar
                $scope.navs = _.without(muceCom.moduleList, 'events', 'metrics');
            }
        }
    }

    angular.module('muceApp.base.directives', []).directive('muceNavbar', navbarDef);
});