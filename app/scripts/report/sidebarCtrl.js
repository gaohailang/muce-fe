define(function() {
    return function sidebarCtrl(apiHelper, $scope, $rootScope) {
        var _state = $rootScope.state;

        $scope.switchTypeVal = function(type, val) {
            _state[type] = val;
        };

        $scope.openEditModal = function(type, data) {
            var newScope = $scope.$new(true);
            $scope._data = data;

            if (type !== 'metric') {
                $modal.open({
                    templateUrl: 'templates/report/modal.html',
                    controller: type + 'ModalCtrl',
                    scope: $scope,
                    size: 'lg'
                });
            } else {
                $modal.open({
                    templateUrl: 'report/metric-tabs-modal.html',
                    size: 'lg'
                });
            }
        };

        $scope.delReport = function(item) {
            if (!window.confirm(Config.delAlertPrefix + 'report ' + item.name)) return;
            apiHelper('delCategorytReportRelation', {
                params: {
                    categoryId: $scope.currentCategory.id,
                    reportId: item.id
                }
            }).then(function(data) {
                // remove from list
                $scope.reportList = _.without($scope.reportList, item);
            });
        };
    };
});