define([
    'base/services/api',
    'base/services/notice',
    'base/services/formly'
], function() {
    angular.module('muceApp.base.services', [
        'muceApp.base.services.api',
        'muceApp.base.services.formly',
        'muceApp.base.services.notice'
    ]);
});