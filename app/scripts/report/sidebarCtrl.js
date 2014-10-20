define(function() {
    // @ngInject
    function sidebarCtrl(apiHelper, $scope, $rootScope, $modal) {
        var _state = $rootScope.state;

        $scope.switchTypeVal = function(type, val) {
            _state[type] = val;
        };

        $scope.openEditModal = function(type, data) {
            // edit for group, category, report
            var newScope = $scope.$new(true);
            $scope._data = _.clone(data);

            $modal.open({
                templateUrl: 'templates/report/modal.html',
                controller: type + 'ModalCtrl',
                scope: $scope,
                size: 'lg'
            });
        };
    }

    return sidebarCtrl;
});