define([], function() {
    // common, muce
    // report, mq

    function capitalize() {
        return function(name) {
            if (!_.isString(name)) return name;
            return name.charAt(0).toUpperCase() + name.slice(1);
        }
    }

    function humanBytes() {
        // trans long bytes to human readable format
        return function(bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
                return '';
            }
            if (typeof precision === 'undefined') {
                precision = 1;
            }
            var units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
        };
    }

    function dateNumFormat() {
        return function(date, spliter) {
            var spliter = spliter || '-';
            var array = date.match(/(\d{4})(\d{2})(\d{2})/);
            return array[1] + spliter + array[2] + spliter + array[3];
        }
    }

    function joinArr() {
        return function(arr, key) {
            return _.pluck(arr, key).join(' / ');
        }
    }

    function linizeArray() {
        return function(arr) {
            return arr.join('\n');
        }
    }

    function percentize() {
        return function(input) {
            var rounded = Math.round(input * 10000) / 100;
            if (isNaN(rounded)) {
                return '';
            }
            var percentage = '' + rounded + '%';
            return percentage;
        };
    }

    angular.module('muceApp.base.filters', [])
        .filter('capitalize', capitalize)
        .filter('joinArr', joinArr)
        .filter('dateNumFormat', dateNumFormat)
        .filter('humanBytes', humanBytes)
        .filter('linizeArray', linizeArray)
        .filter('percentize', percentize);

    angular.module('muceApp.base.filters')
        .filter('transMetricsDetail', function($filter) {
            function buildExp(metric) {
                return metric.target + (metric.conditions ? ' where ' + metric.conditions : '');
            }
            return function(metrics) {
                // type trans
                return _.map(metrics, function(metric) {
                    return metric.name + ': ' + $filter('castDimensionType')(metric.type) + ', ' + buildExp(metric);
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
        });
});