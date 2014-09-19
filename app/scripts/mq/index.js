define([
    'mq/routes',
    'mq/indexCtrl',
    'mq/historyCtrl',
    'mq/editorCtrl',
    'mq/shareCtrl',
    'mq/jobListCtrl'
], function(routeInfo, mqCtrl, mqHistoryCtrl, mqEditorCtrl, mqShareCtrl, mqJobListCtrl) {

    angular.module('muceApp.mq', [])
        .controller('mqEditorCtrl', mqEditorCtrl)
        .controller('mqHistoryCtrl', mqHistoryCtrl)
        .controller('mqShareCtrl', mqShareCtrl)
        .controller('mqJobListCtrl', mqJobListCtrl)
        .controller('mqCtrl', mqCtrl)
        .config(function($stateProvider) {
            _.each(routeInfo, function(opt, name) {
                $stateProvider.state(name, opt);
            });
        });
});