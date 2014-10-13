define(function() {
    // @ngInject
    function delPanelCtrl(apiHelper, $scope, $timeout, $rootScope) {
        var _state = $rootScope.state;
        $scope.delTypes = ['group', 'category', 'metric', 'dimension'];
        $scope.currentDelType = $scope.delTypes[0];

        $scope.$watch('currentDelType', function(val) {
            if (!val) return;
            resetType();
            apiHelper('get' + _.capitalize(val) + 'List').then(function(data) {
                $scope.currentDelList = data;
            });
        });

        function resetType() {
            $scope.currentQuery = '';
            $scope.currentDelList = [];
        }

        $scope.delSelectedHandler = function() {
            var selectedItems = _.filter($scope.currentDelList, function(i) {
                return i.selected
            });
            var selected = _.pluck(selectedItems, 'name');
            if (!selected.length) return;

            function buildAlertStr() {
                var suffix;
                if (selected.length > 1) {
                    suffix = 'those ' + $scope.currentDelType + 's';
                } else {
                    suffix = 'this ' + $scope.currentDelType;
                }
                return Config.delAlertPrefix + suffix + ' :『' + selected.join(', ') + '』';
            }

            if (!window.confirm(buildAlertStr())) return;
            // use selectedItems to ids
            var _key = $scope.currentDelType + 'List';
            _.each(selectedItems, function(item) {
                apiHelper('del' + _.capitalize($scope.currentDelType), item.id).then(function(data) {
                    // remove from list
                    $scope.currentDelList = _.without($scope.currentDelList, item);
                    // remove from $root.state
                    if (_.contains(['group', 'category', 'report'], $scope.currentDelType)) {
                        _state[_key] = _.without(_state[_key], item);
                    }
                });
            });
        };
    };

    return delPanelCtrl;
});