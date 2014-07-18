module.exports = {
    watch: {
        compass: {
            files: ['<%= paths.app %>/compass/**/*'],
            tasks: ['compass:server']
        },
        test: {
            files: ['<%= paths.app %>/javascripts/**/*.js'],
            tasks: ['newer:jshint:test', 'karma:server:run'],
            options: {
                spawn: false
            }
        },
        livereload: {
            files: [
                '<%= paths.app %>/**/*.html',
                '<%= paths.app %>/javascripts/**/*.js',
                '<%= paths.app %>/images/**/*',
                '<%= paths.tmp %>/stylesheets/**/*.css',
                '<%= paths.tmp %>/images/**/*'
            ],
            options: {
                livereload: true,
                spawn: false
            }
        },
        configFiles: {
            files: ['Gruntfile.js'],
            options: {
                reload: true
            }
        }
    },
    open: {
        server: {
            path: 'http://127.0.0.1:<%= connect.options.port %>',
            app: 'Google Chrome Canary'
        }
    },
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
}