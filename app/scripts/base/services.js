define([
    'base/services/api',
    'base/services/notice',
    'base/services/formly',
    'base/services/busy'
], function() {
    angular.module('muceApp.base.services', [
        'muceApp.base.services.api',
        'muceApp.base.services.formly',
        'muceApp.base.services.notice',
        'muceApp.base.services.busy'
    ]);
});