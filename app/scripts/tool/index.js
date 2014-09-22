define([], function() {

    var routeInfo = {
        'tool-uamp': {
            url: '/tool/ua-metric-platform',
            templateUrl: 'templates/tool/ua-metric-platform.html',
            controller: 'UAMPCtrl'
        }
    };

    function UAMPCtrl($scope, $rootScope, apiHelper) {
        $rootScope.state = {};
        var _state = $rootScope.state;
        apiHelper('getUAMPReportList').then(function(data) {
            _state.reportList = data;
            // first or from url
        }).then(function() {
            apiHelper('getUAMPReportDetail', 1).then(function(data) {
                _state.report = data;
            });
        });
    }

    angular.module('muceApp.tool', [])
        .controller('UAMPCtrl', UAMPCtrl)
        .config(function($stateProvider) {
            _.each(routeInfo, function(opt, name) {
                $stateProvider.state(name, opt);
            });
        });
});