define(function() {
    'use strict';
    /*
        使用方法：
        1 global 全局级别的 indicator, 请求时候加上 busy: gloabl
        2 inline 使用 busy="<anchor>" busy-name="anchor"，然后在请求中加上 busy: <anchor>
    */
    angular.module('muceApp.base.services.busy', [])
        .directive('busy', ['$parse', '$timeout',
            function($parse, $timeout) {
                return {
                    restrict: 'A',
                    tranclude: true,
                    scope: {},
                    controller: ['$scope',
                        function($scope) {
                            this.setBusyMessageElement = function(element) {
                                $scope.busyMessageElement = element;
                            }
                        }
                    ],
                    link: function(scope, element, attrs) {
                        attrs.$observe('busy', function(val) {
                            scope.busyMessage = val;
                        });

                        attrs.$observe('busyName', function(val) {
                            scope.busyName = val;
                        });

                        scope.isBusyFor = function(config) {
                            if (scope.busyName) {
                                return config.busy == scope.busyName
                            }
                            return false;
                        };

                        scope.$on('busy.begin', function(evt, config) {
                            if (!scope.busy && scope.isBusyFor(config)) {
                                scope.originalContent = element.html();
                                $timeout(function() {
                                    element.attr('disabled', true);
                                });
                                // var msgElement = scope.busyMessageElement ? scope.busyMessageElement.clone() : null;
                                // TODO: 引入 lodda 类似的 loading 效果
                                element.html('').append(scope.busyMessage);
                                scope.busy = true;
                            }
                        });

                        scope.$on('busy.end', function(evt, config) {
                            if (scope.busy && scope.isBusyFor(config)) {
                                $timeout(function() {
                                    if (scope.originalContent) element.html(scope.originalContent);
                                    element.attr('disabled', false);
                                    scope.busy = false;
                                }, 500); // timeout 500 for instant message
                            }
                        });
                    }
                }
            }
        ])
        .directive('busyMessage', function() {
            // TODO: 支持自定义的 element, lodda
            return {
                restrict: 'AE',
                transclude: true,
                require: '^busy',
                template: '',
                replace: true,
                compile: function(element, attr, transclude) {
                    // we're basically going to transclude the content, strip it, and set the busy message as the resulting transcluded HTML via the controller setBusyMessageElement function
                    return function link(scope, element, attr, busyCtrl) {
                        busyCtrl.setBusyMessageElement(transclude(scope, function() {}));
                    };
                }
            };
        })
        .provider('busyInterceptor', function() {

            this.$get = function($rootScope, $q) {
                function handleResponse(r) {
                    if (!r.config) return;
                    if (!r.config.busy) return;

                    if (r.config.busy === 'global') {
                        angular.element(document.getElementsByClassName('muce-loader')).remove();
                        return;
                    }

                    $rootScope.$broadcast('busy.end', {
                        busy: r.config.busy
                    });
                }

                return {
                    'request': function(config) {
                        if (config.busy) {
                            if (config.busy === 'global') {
                                if ($('.muce-loader.outer').length) return;
                                $('body').append($('<div class="muce-loader outer"><div class="muce-loader inner"></div></div>'));
                            } else {
                                $rootScope.$broadcast('busy.begin', {
                                    busy: config.busy
                                });
                            }
                        }
                        return config || $q.when(config);
                    },
                    'response': function(response) {
                        handleResponse(response);
                        return response;
                    },
                    'responseError': function(rejection) {
                        handleResponse(rejection);
                        return $q.reject(rejection);
                    }
                };
            };

            this.$get.$inject = ['$rootScope', '$q'];
        })
        .config(function($httpProvider) {
            $httpProvider.interceptors.push('busyInterceptor');
        });
});