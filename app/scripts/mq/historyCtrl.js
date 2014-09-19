define(function() {
    return function mqHistoryCtrl($scope, $rootScope, apiHelper, $modal, downloadFile) {
        // 支持 选项： order, querys_showed, more_querys
        function fetchHistory() {
            apiHelper('getJobList', {
                params: {
                    user: 'gaohailang'
                }
            }).then(function(data) {
                $scope.jobList = data ? data.reverse() : [];
            });
        }

        fetchHistory();
        $rootScope.$on('mq:fetchHistory', function(e) {
            fetchHistory();
        });

        $scope.setHqlEditor = function(hql) {
            $rootScope.$emit('mq:setHqlEditor', hql);
        };

        $scope.openJobResultView = function(job) {
            var newScope = $scope.$new(true);
            apiHelper('getJobView', job.id).then(function(data) {
                newScope.result = data;
                openModal();
            });

            function openModal() {
                $modal.open({
                    templateUrl: '/templates/mq/partials/job-result-modal.html',
                    size: 'lg',
                    scope: newScope,
                    controller: function($scope) {
                        // Todo: hive result stdout
                        if ($scope.result) {
                            $scope.result = _.map($scope.result.trim().split('\n'), function(i) {
                                return i.split('\t');
                            });
                        }
                    }
                });
            }
        };

        $scope.downloadJobResultView = function(id) {
            downloadFile(apiHelper.getUrl('getJobResult', id));
        };
    }
});