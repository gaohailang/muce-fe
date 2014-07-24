define([
    'base/services/notice'
], function() {
    function apiHelper($http) {
        /*
            Todo
            1. config.busy 的支持（gloabl, btn, partial etc）
            2. to config api version
        */
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
        */
        var _maps = {},
            _urlPrfix = '/api/v1';

        function _buildUrl(toUrl, params) {
            if (!params) return toUrl;

            _.each(params, function(val) {
                if (toUrl.indexOf(':') > -1) {
                    toUrl = toUrl.replace(/:[^/]+/, val);
                } else {
                    toUrl = toUrl + '/' + val;
                }
            });
            return toUrl;
        }

        function helper(endpoint, opt) {
            arguments = _.toArray(arguments);
            var apiStr = _maps[arguments.shift()];
            if (_.isObject(_.last(arguments))) {
                opt = arguments.pop();
            } else {
                opt = {};
            }
            if (!apiStr) throw new Error('Endpint ' + endpoint + 'Does Not Exist!');

            return $http(_.extend({
                method: apiStr.split(' ')[0],
                cache: true,
                url: _urlPrfix + _buildUrl(apiStr.split(' ')[1], arguments),
            }, opt));
        }

        helper.config = function(maps) {
            _maps = _.extend(_maps, maps);
        };

        helper.configByType = function(maps, opt) {
            // maps = _.extend({}, maps); // no need for ensure key-value exist
            var processMaps = {};
            var opt = opt || {
                prefix: ''
            };
            // need template to build?
            _.each(maps.add, function(endpoint) {
                processMaps['add' + _.slugify(endpoint)] = 'POST ' + opt.prefix + endpoint;
            });
            _.each(maps.del, function(endpoint) {
                processMaps['del' + _.slugify(endpoint)] = 'DELETE ' + opt.prefix + endpoint;
            });
            _.each(maps.list, function(endpoint) {
                processMaps['get' + _.slugify(endpoint) + 'List'] = 'GET ' + opt.prefix + endpoint + 's';
            });
            _.each(maps.item, function(endpoint) {
                processMaps['get' + _.slugify(endpoint)] = 'GET ' + opt.prefix + endpoint;
            });
            this.config(processMaps);
        };

        return helper;
    }

    angular.module('muceApp.base.services.api', ['muceApp.base.services.notice'])
        .factory('apiHelper', ['$http', apiHelper])
        .factory('apiHelperInterceptor', function($q, $notice) {
            return {
                responseError: function(response) {
                    // if (response.config.url.indexOf('/api/') > -1) {
                    $notice.error('error-' + response.status + ': ' +
                        (response.config.url || '') + (response.data.msg || ', 接口出问题啦!'));
                    // }
                    return $q.reject(response);
                },

                response: function(response) {
                    // config be closed
                    if (response.config.url.indexOf('/api/') > -1) {
                        if (response.config.method === 'POST') {
                            $notice.success('操作成功！');
                        }
                        return response.data.data;
                    }
                    return response;
                }
            };
        })
        .config(function($httpProvider) {
            $httpProvider.interceptors.push('apiHelperInterceptor');
        });
});