var lrSnippet = require('connect-livereload')();
var mountFolder = function(connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = {
    connect: {
        options: {
            port: 9999,
            hostname: '0.0.0.0'
        },
        server: {
            options: {
                middleware: function(connect) {
                    return [
                        lrSnippet,
                        mountFolder(connect, pathConfig.tmp),
                        mountFolder(connect, pathConfig.app)
                    ];
                }
            }
        }
    }
};