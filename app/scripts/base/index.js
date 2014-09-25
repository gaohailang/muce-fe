define([
    'base/helper',
    'base/services',
    'base/filters',
    'base/directives'
], function() {

    angular.module('muceApp.base', ['muceApp.base.services', 'muceApp.base.filters', 'muceApp.base.directives'])
        .run(function($notice, $timeout, $rootScope) {
            // appTitle
            $rootScope.$watch('appTitle', function(val) {
                if (!val) return;
                document.title = val + ' - Muce 3.0 - Wandoulabs';
            });

            // add compatible check and notice
            if (navigator && navigator.userAgent && (navigator.userAgent.indexOf('Chrome') === -1)) {
                $timeout(function() {
                    $notice.warning('您使用的浏览器可能存在兼容性问题，建议您使用 Chrome 来更好的使用 Muce 服务');
                }, 3000);
            }
        });
});