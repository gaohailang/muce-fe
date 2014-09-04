define(function() {
    function mqHistoryCtrl($scope, apiHelper, $modal) {
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
                    templateUrl: '/templates/mq/job-result.html',
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
    }

    function mqCtrl($scope, apiHelper, $modal, $state) {

        $scope.currentTbView = 'schema';
        $scope.form = {};

        apiHelper('getDatabases').then(function(data) {
            $scope.allDbs = data;
        });

        $scope.changeDb = function(db) {
            $scope.allTables = [];
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
            // change to info state
            if (!$state.is('mq.info')) {
                $state.go('mq.info');
            }
        };

        $scope.switchTbView = function(view) {
            $scope.currentTbView = view;
        };

        $scope.runQuery = function() {
            apiHelper('addJob', {
                notification: $scope.form.notification
                hql: $scope.form.hql
                user: $scope.form.user
            }).then(function() {

            });
        };

        $scope.composeNewQuery = function() {
            $scope.form = {};
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
                "Ctrl-Space": "autocomplete"
            },
            hintOptions: {
                tables: {
                    users: {
                        score: null,
                        birthDate: null,
                        'name.test.test': null,
                        'name.sxx.test': null
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
                    if (change.origin != '+input') return;
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
    }

    angular.module('muceApp.mq', [])
        .controller('mqHistoryCtrl', mqHistoryCtrl)
        .controller('mqCtrl', mqCtrl);
})