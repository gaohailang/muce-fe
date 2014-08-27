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
        .controller('noticesController', function($scope, $attrs, $rootScope) {
            $scope.close = function(notice) {
                $rootScope._notices = _.without($rootScope._notices, notice);
            };
        })
        .factory('$notice', noticeFactory)
        .directive('muceNotices', function() {
            return {
                restrict: 'EA',
                controller: 'noticesController',
                templateUrl: 'snippet/notices.html'
            };
        })

    .run(function($templateCache) {
        $templateCache.put("snippet/notices.html",
            "<div class='muce-notices'>" +
            "<div ng-repeat='notice in $root._notices' class='alert alert-dismissible' role='alert' ng-class='\"alert-\" + (type || \"warning\")'>\n" +
            '    <button type="button" class="close" data-dismiss="alert"><span>&times;</span></button>\n' +
            "    {{notice.msg}}\n" +
            "</div></div>"
        );
    });
});