define(function() {
    function mqShareCtrl($scope, apiHelper) {

        $scope.mqShareInputHandler = function(e) {
            if (e.keyCode === 13) {
                $scope.queryUserJobList();
            }
        };

        $scope.queryUserJobList = function() {
            apiHelper('getJobList', {
                params: {
                    user: $scope.userName
                }
            }).then(function(data) {
                $scope.jobList = data ? data.reverse() : [];
            });
        }
    }

    angular.module('muceApp.mq.mqShareCtrl', [])
        .controller('mqShareCtrl', mqShareCtrl);
});