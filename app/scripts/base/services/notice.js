define([], function() {
    'use strict';

    function noticeFactory(toaster) {
        var $notice = {};
        _.each(['error', 'info', 'wait', 'success', 'warning'], function(type) {
            // trustedHtml - <ul><li>Render html</li></ul>
            // template - myTpl.html
            $notice[type] = function(msg, title, timeout, msgType) {
                toaster.pop(type, title, msg, timeout, 'trustedHtml');
            };
        });
        return $notice;
    }

    angular.module('muceApp.base.services.notice', ['toaster'])
        .factory('$notice', noticeFactory);
});