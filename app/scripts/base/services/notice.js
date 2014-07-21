define([], function() {
    'use strict';

    function noticeFactory($rootScope, $timeout) {
        var $notice = {};
        $notice.add = function(msgObj) {
            $rootScope._notices = $rootScope._notices || [];
            $rootScope._notices.push(msgObj);
            $timeout(function() {
                $rootScope._notices = _.without($rootScope._notices, msgObj);
            }, msgObj.timeout || 3000);
        };

        _.each(['error', 'info', 'success', 'warning'], function(type) {
            // support timeout opt
            $notice[type] = function(msg, opt) {
                $notice.add(_.extend({
                    type: type,
                    msg: msg
                }, opt));
            };
        });
        return $notice;
    }

    angular.module('muceApp.base.services.notice', [])
        .controller('noticeController', function($scope, $attrs, $rootScope) {
            $scope.close = function(notice) {
                $rootScope._notices = _.without($rootScope._notices, notice);
            };
        })
        .factory('$notice', noticeFactory)
        .directive('muceNotice', function() {
            return {
                restrict: 'EA',
                controller: 'noticeController',
                templateUrl: 'snippet/notice.html',
                transclude: true,
                replace: true,
                scope: {
                    type: '=',
                    notice: '='
                }
            };
        })
        .directive('muceNotices', function() {
            return {
                restrict: 'EA',
                templateUrl: 'snippet/notices.html'
            };
        })
        .run(function($templateCache) {
            $templateCache.put("snippet/notice.html",
                "<div class='alert' ng-class='\"alert-\" + (type || \"warning\")'>\n" +
                "    <button type='button' class='close' ng-click='close(notice)'>&times;</button>\n" +
                "    <div ng-transclude></div>\n" +
                "</div>\n");
            $templateCache.put("snippet/notices.html",
                "<muce-notice ng-repeat='notice in $root._notices' notice='notice' type='notice.type'>" +
                "    <div>{{notice.msg}}</div>" +
                "</muce-notice>");
        });
});