define([
    'base/services/api',
    'base/services/notice',
    'base/services/formly',
    'base/services/busy',
    'base/services/sso'
], function() {
    angular.module('muceApp.base.services', [
        'muceApp.base.services.api',
        'muceApp.base.services.formly',
        'muceApp.base.services.notice',
        'muceApp.base.services.busy',
        'muceApp.base.services.sso'
    ]).factory('downloadFile', downloadFile);

    function downloadFile() {
        return function(url) {
            var iFrame = $('#download-file-iframe');
            if (!iFrame.length) {
                iFrame = $('<iframe id="download-file-iframe" style="position:fixed;display:none;top:-1px;left:-1px;"/>');
                $('body').append(iFrame);
            }
            iFrame.attr('src', url);
        }
    }
});