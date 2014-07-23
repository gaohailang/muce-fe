define(['base/muceCom'], function(muceCom) {

    angular.module('muceApp.base.filters', []).filter('capitalize', function() {
        return function(name) {
            if (!_.isString(name)) return name;
            return name.charAt(0).toUpperCase() + name.slice(1);
        }
    }).filter('joinArr', function() {
        return function(arr, key) {
            return _.pluck(arr, key).join(' / ');
        }
    }).filter('transMetricsDetail', function() {
        return function(metrics) {
            // type trans
            return _.map(metrics, function(metric) {
                return metric.name + ': ' + metric.type + ', ' + metric.expression;
            }).join('\n')
        }
    });
});