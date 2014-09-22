define(function() {
    var SSO_LOCATION = 'http://sso.wandoulabs.com/';

    angular.module('muceApp.base.services.sso', [])
        .provider('ssoInterceptor', function() {
            this.$get = function($rootScope, $q) {
                return {
                    'responseError': function(response) {
                        if (response.status === 403) {
                            window.location.href = SSO_LOCATION + '?redirect=' + window.location.href;
                            return;
                        }
                        return $q.reject(response);
                    }
                };
            };

            this.$get.$inject = ['$rootScope', '$q'];
        })
        .config(function($httpProvider) {
            $httpProvider.interceptors.push('ssoInterceptor');
        }).run(function($http, $rootScope) {
            $http.jsonp(SSO_LOCATION + 'getUserInfo/?jsonp=JSON_CALLBACK').then(function(resp) {
                var data = resp.data;
                if (data.code == 200) {
                    $rootScope.userInfo = data.result;
                } else {
                    window.location.href = SSO_LOCATION + '?redirect=' + window.location.href;
                }
            });
        });
});