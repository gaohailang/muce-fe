define([
    'base/services/notice'
], function() {
    function apiHelper($http) {
        /*
            way to use the api:
            每个 biz module 有个 endpoint api map

            var apiMap = {
                delBlackList: 'GET /api/app/:app_id/blacklist/delete',
                fetchStat: 'GET /api/adformat/statement/:id'
            };

            apiHelper.config(apiMap);

            apiHelper('delBlackList', app_id, config).then(function() {

            });

            inner data strut - method, url
        */
        var _maps = {},
            _urlPrfix = '/api/v1';

        function _buildUrl(toUrl, params) {
            if (!params) return toUrl;

            _.each(params, function(val) {
                if (toUrl.indexOf('/:') > -1) {
                    toUrl = toUrl.replace(/\/:[^/]+/, '/' + val);
                } else {
                    toUrl = toUrl + '/' + val;
                }
            });
            return toUrl;
        }

        // endpont[, url part arr][,data/params][,opt]
        function helper(endpoint, opt) {
            arguments = _.toArray(arguments);
            var _api = _maps[arguments.shift()];
            if (!_api) throw new Error('Endpint ' + endpoint + 'Does Not Exist!');
            if (_.isObject(_.last(arguments))) {
                opt = arguments.pop();
            } else {
                opt = {};
            }
            if (_.isObject(_.last(arguments))) {
                if (/(DELETE)|(GET)/.test(_api.method)) {
                    opt.params = arguments.pop();
                } else {
                    opt.data = arguments.pop();
                }
            }

            return $http(_.extend({
                method: _api.method,
                // cache: true,
                url: _buildUrl(_api.url, arguments),
            }, opt));
        }

        helper.config = function(maps, opt) {
            var _prefix = _urlPrfix;
            if (opt && opt.urlPrefix) {
                _prefix = opt.urlPrefix;
            }
            _.each(maps, function(apiStr, key) {
                maps[key] = {
                    method: apiStr.split(' ')[0],
                    url: _prefix + apiStr.split(' ')[1]
                };
            });
            _maps = _.extend(_maps, maps);
        };

        helper.configByType = function(maps, opt) {
            var processMaps = {};
            var opt = opt || {
                prefix: ''
            };
            var _httpVerbMethodMap = [
                ['add', 'POST'],
                ['edit', 'PUT'],
                ['del', 'DELETE'],
                ['item', 'GET']
            ];
            _.each(_httpVerbMethodMap, function(rule) {
                var name = rule[0];
                var method = rule[1];
                _.each(maps[name], function(endpoint) {
                    processMaps[name + _.slugify(endpoint)] = method + ' ' + opt.prefix + endpoint;
                });
            });
            _.each(maps.list, function(endpoint) {
                processMaps['get' + _.slugify(endpoint) + 'List'] = 'GET ' + opt.prefix + endpoint + 's';
            });
            this.config(processMaps);
        };

        helper.getUrl = function(endpoint) {
            arguments = _.toArray(arguments);
            var _api = _maps[arguments.shift()];
            return _buildUrl(_api.url, arguments)
        };

        return helper;
    }

    angular.module('muceApp.base.services.api', ['muceApp.base.services.notice'])
        .factory('apiHelper', ['$http', apiHelper])
        .factory('apiHelperInterceptor', function($q, $notice) {
            function responseErrorHandler(response) {
                try {
                    $notice.error('status-' + response.status + ': ' +
                        (response.config.url || '') + '<br>' + (response.data.msg || ', 接口出问题啦!'));
                } catch (e) {
                    console.log('Err in apiHelperInterceptor: ' + e);
                }
                return $q.reject(response);
            }

            function responseHandler(response) {
                if (response.config.url.indexOf('/api/') > -1) {
                    if (_.contains(['PUT', 'POST', 'DELETE'], response.config.method)) {
                        $notice.success('操作成功！');
                    }
                    if (response.data.data) {
                        return response.data.data;
                    } else {
                        return response.data;
                    }
                }
                return response;
            }

            return {
                responseError: responseErrorHandler,
                response: responseHandler
            };
        })
        .config(function($httpProvider) {
            $httpProvider.interceptors.push('apiHelperInterceptor');
        });
});