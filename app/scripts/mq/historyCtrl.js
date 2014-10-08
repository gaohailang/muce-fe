define(function() {
    function mqHistoryCtrl($scope, $rootScope, apiHelper) {
        // 支持 选项： order, querys_showed, more_querys
        function fetchHistory() {
            apiHelper('getJobList').then(function(data) {
                $scope.jobList = data ? data.reverse() : [];
            });
        }

        fetchHistory();
        $rootScope.$on('mq:fetchHistory', function(e) {
            fetchHistory();
        });
    }

    angular.module('muceApp.mq.mqHistoryCtrl', [])
        .controller('mqHistoryCtrl', mqHistoryCtrl);
});