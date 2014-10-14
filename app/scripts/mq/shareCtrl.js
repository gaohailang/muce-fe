define(function() {
    function mqShareCtrl($scope, apiHelper, $http) {

        $scope.mqShareInputHandler = function(e) {
            if (e.keyCode === 13) {
                $scope.queryUserJobList();
            }
        };
        $scope.hasQueryJobList = false;
        $scope.queryUserJobList = function() {
            $scope.hasQueryJobList = false;
            apiHelper('getJobList', {
                params: {
                    user: $scope.target.id
                },
                busy: 'global'
            }).then(function(data) {
                $scope.hasQueryJobList = true;
                $scope.jobList = data ? data.reverse() : [];
            });
        }

        $http.get('http://who.wandoulabs.com/api/v1/list/person/').then(function(data) {
            $scope.whoList = data;
        });
    }

    angular.module('muceApp.mq.mqShareCtrl', [])
        .controller('mqShareCtrl', mqShareCtrl);
});