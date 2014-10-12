define([], function() {

    function managementBaseCtrl($scope, apiHelper) {
        $scope.toggleResStatus = function() {
            console.log(arguments);
        };
    }

    var viewCtrls = _.map(['metric', 'dimension', 'report'], function(type) {
        return ['$scope', 'apiHelper', '$rootScope', '$modal', function($scope, apiHelper, $rootScope, $modal) {
            var capitalizeType = _.capitalize(type);
            apiHelper('getDetail' + capitalizeType + 'sList').then(function(data) {
                $scope[type + 'List'] = data;
            });

            $scope['del' + capitalizeType] = function(item) {
                apiHelper('del' + capitalizeType, item.id).then(function() {
                    var alertTip = Config.delAlertPrefix + type + ' ' + item.name;
                    if (!window.confirm(alertTip)) return;
                    // remove metric from list
                    $scope[type + 'List'] = _.without($scope[type + 'List'], item);
                });
            };

            $scope['edit' + capitalizeType] = function(item) {
                var newScope = $scope.$new(true);
                $scope._data = _.clone(item);

                var templateUrl;
                if (!$scope.delMetric) {
                    templateUrl = 'templates/report/modal.html';
                } else {
                    templateUrl = 'report/metric-tabs-modal.html';
                }
                $modal.open({
                    templateUrl: templateUrl,
                    controller: type + 'ModalCtrl',
                    scope: $scope,
                    size: 'lg'
                });
            };
        }]
    });

    angular.module('muceApp.report.management', [])
        .controller('managementBaseCtrl', managementBaseCtrl)
        .controller('viewMetricsCtrl', viewCtrls[0])
        .controller('viewDimensionsCtrl', viewCtrls[1])
        .controller('viewReportsCtrl', viewCtrls[2]);
});