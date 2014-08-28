require([
    './misc',
    'base/muceCom',
    'mq',
    './base',
    './api',
    'report/index'
], function(misc, MuceCom, Mq) {
    'use strict';

    var muceApp = angular.module('muceApp', [
        'ui.router',
        'ui.bootstrap',
        'ui.codemirror',
        // 'ui.select',
        'ngSanitize',
        'ngQuickDate',
        'muceApp.api',
        'muceApp.base',
        'muceApp.report'
    ]);

    function tongji() {
        $('<img/>').attr('src', '/images/tongji.png');
    };

    muceApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
        $locationProvider.html5Mode(true).hashPrefix('!');
        // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
        $urlRouterProvider.otherwise('/');

        $stateProvider.state('index', {
            url: '/',
            templateUrl: 'templates/report.html',
            controller: 'reportCtrl'
        });
        _.each(MuceCom.moduleList, function(module) {
            $stateProvider.state(module, {
                url: '/' + module,
                templateUrl: 'templates/' + module + '.html',
                controller: module + 'Ctrl'
            });
        });
    });

    // muceApp.config(function(uiSelectConfig) {
    //     uiSelectConfig.theme = 'select2';
    // });

    muceApp.run(function() {
        // set window.userName which is required by ...
        window.userName = MuceCom.getNameFromCookie();
    });

    muceApp.controller('mqCtrl', function($scope, apiHelper, $modal) {

        $scope.currentTbView = 'schema';

        apiHelper('getDatabases').then(function(data) {
            $scope.allDbs = data;
        });

        $scope.changeDb = function(db) {
            $scope.currentDb = db;
            apiHelper('getDbTable', db).then(function(data) {
                $scope.allTables = data;
            });
        };

        $scope.changeTable = function(tb) {
            var db = $scope.currentDb;
            $scope.currentTb = tb;
            $scope.tbInfo = {};
            apiHelper('getDbSchema', db, tb).then(function(data) {
                $scope.tbInfo.schema = data;
            });
            apiHelper('getDbParts', db, tb).then(function(data) {
                $scope.tbInfo.partition = data;
            });
        };

        $scope.switchTbView = function(view) {
            $scope.currentTbView = view;
        };

        apiHelper('getJobList', {
            from: 'gaohailang'
        }).then(function(data) {
            $scope.jobList = data;
            _.each(data, function(job, i) {
                if (job.status === 'FAILED') return;
                apiHelper('getJobResultSize', job.id).then(function(data) {
                    job.size = data;
                });
            });
        });

        $scope.openJobResultView = function(job) {
            var newScope = $scope.$new(true);
            if (job.status === 'FAILED') {
                newScope.reason = job.reason;
                open();
            } else {
                apiHelper('getJobView', job.id).then(function(data) {
                    newScope.result = data;
                    open();
                });
            }

            function open() {
                $modal.open({
                    templateUrl: 'templates/mq/job-result.html',
                    size: 'lg',
                    scope: newScope,
                    controller: function($scope) {
                        // Todo: hive result stdout
                        if ($scope.result) {
                            $scope.result = _.map($scope.result.split('\n'), function(i) {
                                return i.split('\t');
                            });
                        }
                    }
                });
            }
        };

        $scope.downloadJobResultView = function(id) {
            apiHelper('getJobResult', id);
        };


        $scope.editorOptions = {
            autofocus: true,
            lineWrapping: true,
            lineNumbers: true,
            indentWithTabs: true,
            smartIndent: true,
            matchBrackets: true,
            // readOnly: 'nocursor',
            mode: 'text/x-hive',
            extraKeys: {
                // "Ctrl-Space": "autocomplete"
            },
            hintOptions: {
                tables: {
                    users: {
                        name: null,
                        score: null,
                        birthDate: null
                    },
                    countries: {
                        name: null,
                        population: null,
                        size: null
                    }
                }
            },
            onLoad: function(_editor) {
                // Editor part
                var _doc = _editor.getDoc();
                _editor.focus();

                _editor.on("change", function(cm, change) {
                    console.log(arguments);
                    if (change.origin == '+input') return;
                    // +input, +delete, complete
                    CodeMirror.showHint(cm);
                });

                _editor.on("change", autoReplace);

                function autoReplace(cm, change) {
                    var replacements = {
                        "lambda": "λ",
                        "mc": "muce",
                        "wdj": "wandoujia",
                        "*": "×",
                        "/": "÷",
                        "<=": "≤",
                        ">=": "≥",
                        "!=": "≠",
                    };

                    if (change.text[0] !== ".") return; // todo: replace space to comma
                    var type = cm.getTokenTypeAt(change.from);
                    // if (type !== "operator" && type !== "builtin") return;
                    var token = cm.getTokenAt(change.from, true);
                    var replacement = replacements[token.string];
                    if (!replacement) return;
                    var line = change.to.line;
                    cm.replaceRange(replacement, {
                        ch: token.start,
                        line: line
                    }, {
                        ch: token.end,
                        line: line
                    });
                }
            }
        };


        $scope.$watch('currentMqRaw', function(val) {
            if (!val) return;
            if (val.split('\n').length > 7) {
                $('.mq-editor-wrapper .CodeMirror').css('height', 'auto');
            } else {
                $('.mq-editor-wrapper .CodeMirror').css('height', '112px');
            }
        });
    });

    muceApp.controller('feedbackCtrl', function($scope) {
        console.log('in feedbackCtrl');
    });

    angular.bootstrap(document, ['muceApp']);
});