define(function() {
    return function mqHistoryCtrl($scope, apiHelper, $modal, downloadFile) {
        // 支持 选项： order, querys_showed, more_querys
        apiHelper('getJobList', {
            params: {
                user: 'gaohailang'
            }
        }).then(function(data) {
            $scope.jobList = data ? data.reverse() : [];
            /*_.each(data, function(job, i) {
                if (job.status === 'FAILED') return;
                apiHelper('getJobResultSize', job.id).then(function(data) {
                    job.size = data;
                });
            });*/
        });

        $scope.openJobResultView = function(job) {
            var newScope = $scope.$new(true);
            apiHelper('getJobView', job.id).then(function(data) {
                newScope.result = data;
                openModal();
            });

            function openModal() {
                $modal.open({
                    templateUrl: '/templates/mq/modal-job-result.html',
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