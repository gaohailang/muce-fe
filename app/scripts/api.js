define([], function() {

    angular.module('muceApp.api', []).run(function(apiHelper) {
        // Meta
        apiHelper.configByType({
            add: ['group', 'category', 'dimension', 'metric', 'combineMetric', 'report'],
            del: ['group', 'category', 'dimension', 'metric', 'categorytReportRelation'],
            list: ['group', 'category', 'report', 'event', 'field', 'metric', 'dimension'],
            item: ['reportDetail']
        }, {
            prefix: '/meta/'
        });

        // Report
        apiHelper.config({
            'getReport': 'GET /report/:id'
        });

        // Muce Query
        apiHelper.config({
            'addJob': 'POST /mq/job',
            'getJob': 'GET /mq/job/:id',
            'delJob': 'DELETE /mq/job/:id',
            'getJobList': 'GET /mq/job',

            'getJobResult': 'GET /mq/job/:id/result',
            'getJobResultSize': 'GET /mq/job/:id/result/size',
            'getJobView': 'GET /mq/job/:id/view',

            'getDatabases': 'GET /mq/databases',
            'getDbTable': 'GET /mq/:db/tables',
            'getDbSchema': 'GET /mq/:db/:tb/schema',
            'getDbParts': 'GET /mq/:db/:table/partitions'
        });
    });
})