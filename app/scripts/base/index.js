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
                var _title = val + ' - Muce 3.0 - Wandoulabs';
                if (val.indexOf('#NOMUCE')) {
                    _title = _title.replace('#NOMUCE', '').replace(' - Muce 3.0', '');
                }
                document.title = _title;
            });

            // add compatible check and notice
            if (navigator && navigator.userAgent && (navigator.userAgent.indexOf('Chrome') === -1)) {
                $timeout(function() {
                    $notice.warning('您使用的浏览器可能存在兼容性问题，建议您使用 Chrome 来更好的使用 Muce 服务');
                }, 3000);
            }

            // scroll
            $('.scroll-key span').click(function(e) {
                var $target = $(e.target);
                var $body = $("html, body");
                if ($target.hasClass('scroll-top')) {
                    $body.animate({
                        scrollTop: 0
                    }, '500', 'swing');
                } else {
                    $body.animate({
                        scrollTop: $(document).height()
                    }, '500', 'swing');
                }
            });

            // collapse the sidebar
            $('body').on('click', '.collapse-sidebar-trigger', function(e) {
                if ($(e.target).hasClass('icon-double-angle-left')) {
                    $(e.target).removeClass('icon-double-angle-left').addClass('icon-double-angle-right');
                    $('.collapse-sidebar-container').addClass('sidebar-collapsed');
                    $rootScope.$broadcast('base:sidebar-collapsed', true);
                } else {
                    $(e.target).removeClass('icon-double-angle-right').addClass('icon-double-angle-left');
                    $('.collapse-sidebar-container').removeClass('sidebar-collapsed');
                    $rootScope.$broadcast('base:sidebar-collapsed', false);
                }
            });

            ZeroClipboard.config({
                swfPath: 'http://static.wdjimg.com/ajax/libs/zeroclipboard/2.1.6/ZeroClipboard.swf'
            });
        });
});