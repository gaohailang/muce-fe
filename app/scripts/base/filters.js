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
        function buildExp(metric) {
            return metric.target + (metric.conditions ? ' where ' + metric.conditions : '');
        }

        return function(metrics) {
            // type trans
            return _.map(metrics, function(metric) {
                return metric.name + ': ' + metric.type + ', ' + buildExp(metric);
            }).join('\n')
        }
    }).filter('transPeriod', function() {
        return function(val) {
            var _map = {
                '0': 'Day',
                '1': 'Hour'
            };
            return _map[val];
        }
    }).filter('castDimensionType', function() {
        return function(val) {
            return _.db.dimensionTypes[val];
        }
    }).filter('dateNumFormat', function() {
        return function(date, spliter) {
            var spliter = spliter || '-';
            var array = date.match(/(\d{4})(\d{2})(\d{2})/);
            return array[1] + spliter + array[2] + spliter + array[3];
        }
    });
});