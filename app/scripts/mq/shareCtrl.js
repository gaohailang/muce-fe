define(function() {
    return function($scope, apiHelper) {

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
});