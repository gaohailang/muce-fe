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
            var array = new String(date).match(/(\d{4})(\d{2})(\d{2})/);
            return array[1] + spliter + array[2] + spliter + array[3];
        }
    }

    function joinArr() {
        return function(arr, key) {
            return _.pluck(arr, key).join(' / ');
        }
    }

    function joinArrExt() {
        return function(arr, opt) {
            return _.pluck(arr, opt.key).join(opt.joiner);
        }
    }

    function linizeArray() {
        return function(arr) {
            return arr.join('<br>');
        }
    }

    angular.module('muceApp.base.filters', [])
        .filter('capitalize', capitalize)
        .filter('joinArr', joinArr)
        .filter('dateNumFormat', dateNumFormat)
        .filter('humanBytes', humanBytes)
        .filter('linizeArray', linizeArray)
        .filter('joinArrExt', joinArrExt)
        .filter('percentize', ['$filter',
            function($filter) {
                return function(input, decimals) {
                    var decimals = decimals ? decimals : 2;
                    if (isNaN(input)) return '';
                    return $filter('number')(input * 100, decimals) + '%';
                };
            }
        ]);

    angular.module('muceApp.base.filters')
        .filter('transMetricsDetail', function($filter) {
            function buildExp(metric) {
                return metric.target + (metric.conditions ? ' where ' + metric.conditions : '');
            }
            return function(metrics) {
                // type trans
                return _.map(metrics, function(metric) {
                    return metric.name + ': ' + $filter('castTypeFromInt')(metric.type) + ', ' + buildExp(metric);
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
        }).filter('castTypeFromInt', function() {
            return function(val) {
                return _.db.dimensionTypes[val];
            }
        }).filter('percentage', function() {
            return function(input) {
                var rounded = Math.round(input * 10000) / 100;
                if (isNaN(rounded)) {
                    return '';
                }
                var percentage = '' + rounded + '%';
                return percentage;
            };
        });
});