define(['base/muceCom'], function(muceCom) {

    angular.module('muceApp.base.filters', []).filter('capitalize', function() {
        return function(name) {
            if (!_.isString(name)) return name;
            return name.charAt(0).toUpperCase() + name.slice(1);
        }
    })
});