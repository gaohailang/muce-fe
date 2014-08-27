var fs = require('fs');

function renderFsMock(path) {
    return JSON.parse(fs.readFileSync('./mock/data/' + path, 'utf8'));
}

// Todo More Mock Helper _.dateRange, etc, incrId -> ItemList

module.exports = {
    'GET /api/v1/report/1?.*': renderFsMock('report-1-data.json'),
    'GET /api/v1/meta/report/.*': renderFsMock('report-1-detail.json'),
    // 'GET /api/v1/meta/reports': renderFsMock('reports.json'),
    'POST REGEX': function() {

    }
};