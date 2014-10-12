define([], function() {

    angular.module('muceApp.api', []).run(function(apiHelper) {
        // Meta
        apiHelper.configByType({
            add: ['group', 'category', 'dimension', 'metric', 'combineMetric', 'report'],
            edit: ['group', 'category', 'dimension', 'metric', 'combineMetric', 'report'],
            del: ['group', 'category', 'dimension', 'metric', 'categoryReportRelation', 'report'],
            list: ['group', 'category', 'report', 'event', 'field', 'fieldId', 'metric', 'dimension']
        }, {
            prefix: '/meta/'
        });

        // Report
        apiHelper.config({
            'getReport': 'GET /report/:id',
            'getReportDetail': 'GET /meta/report/:id',
            'getDetailMetricsList': 'GET /meta/viewMetrics',
            'getDetailDimensionsList': 'GET /meta/viewDimensions',
            'getDetailReportsList': 'GET /meta/viewReports'
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
            'getDbParts': 'GET /mq/:db/:table/partitions',

            'getEventAbbr': 'GET /meta/eventAbb',
            'getEventFields': 'GET /meta/eventFields'
        });

        // Tools - ua metric platform - prefix UAMP
        apiHelper.config({
            'getUAMPReportList': 'GET /reportList',
            'getUAMPReportDetail': 'GET /report/:id',
            'getUAMPReportData': 'GET /reportData/:id',
            'getUAMPChartData': 'GET /chartData'
        }, {
            urlPrefix: 'http://apps-datatools0-bgp0.hy01.wandoujia.com:4000/api'
        });
    });
})