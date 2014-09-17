define([
    'mq/routes',
    'mq/indexCtrl',
    'mq/historyCtrl',
    'mq/editorCtrl'
], function(routeInfo, mqCtrl, mqHistoryCtrl, mqEditorCtrl) {

    angular.module('muceApp.mq', [])
        .controller('mqEditorCtrl', mqEditorCtrl)
        .controller('mqHistoryCtrl', mqHistoryCtrl)
        .controller('mqCtrl', mqCtrl)
        .config(function($stateProvider) {
            _.each(routeInfo, function(opt, name) {
                $stateProvider.state(name, opt);
            });
        });
});