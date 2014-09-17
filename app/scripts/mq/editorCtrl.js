define(function() {
    return function mqEditorCtrl($scope, $rootScope, $interval, apiHelper) {
        $scope.form = {};

        $scope.runQuery = function() {
            $scope.form.user = 'gaohailang';

            // $interval.cancel(stopTime);
            var curTime = 0;

            apiHelper('addJob', {
                data: $scope.form
            }).then(function(data) {
                // Todo: know the job id
                $scope.currentJob = data;
                // $state.go -> history?!
                var runTimer = $interval(function() {
                    $scope.runTimeText = getFormatedTimeDelta(curTime);
                    curTime += 7;
                }, 70);
                var runStatusTimer = $interval(function() {
                    apiHelper('getJob', data.id).then(function(job) {
                        $scope.currentJob = job;
                        if (job.status === 'COMPLETED') {
                            $interval.cancel(runTimer);
                            $interval.cancel(runStatusTimer);
                            // NOTICE BY TOGGLE document.title
                        }
                    }, function() {
                        $interval.cancel(runTimer);
                        // same with
                    });
                }, 3000);
            }, function() {
                // error handler
                // alert-error(error.reason)
                // label-import - error.responseText
            });
        };

        $scope.resetHqlEditor = function(hql) {
            if ($scope.currentJob) return;
            $scope.form.hql = hql;
        };

        $rootScope.composeNewQuery = function() {
            $scope.form = {};
            $scope.currentJob = null;
        };

        $scope.editorOptions = {
            autofocus: true,
            lineWrapping: true,
            lineNumbers: true,
            indentWithTabs: true,
            smartIndent: true,
            matchBrackets: true,
            mode: 'text/x-hive',
            extraKeys: {
                "Ctrl-Space": "autocomplete"
            },
            hintOptions: {
                completeSingle: false,
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
                _editor.focus();

                _editor.on("change", function(cm, change) {
                    console.log(arguments);
                    if (change.origin != '+input') return;
                    // +input, +delete, complete
                    CodeMirror.showHint(cm);
                });

                _editor.on("change", autoReplace);

                var replacements = {};
                apiHelper('getEventAbbr').then(function(data) {
                    _.extend(replacements, data);
                });

                function autoReplace(cm, change) {

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

        $scope.$watch('form.hql', function(val) {
            if (!val) return;
            if (val.split('\n').length > 7) {
                $('.mq-editor-wrapper .CodeMirror').css('height', 'auto');
            } else {
                $('.mq-editor-wrapper .CodeMirror').css('height', '112px');
            }
        });

        function pad(number, length) {
            var str = '' + number;
            while (str.length < length) {
                str = '0' + str;
            };
            return str;
        }

        function getFormatedTimeDelta(curTime) {
            var min = parseInt(curTime / 6000);
            var sec = parseInt(curTime / 100) - (min * 60);
            var micro = pad(curTime - (sec * 100) - (min * 6000), 2);
            var showTime = "";
            if (min > 0) {
                showTime = pad(min, 2) + ':';
            };
            showTime = showTime + pad(sec, 2) + ':' + micro;
            return showTime;
        }
    }
});