var grunt = require('grunt');

var lrSnippet = require('connect-livereload')();

function mountFolder(connect, dir) {
    return connect.static(require('path').resolve(dir));
}

function requireUncached(module) {
    try {
        delete require.cache[require.resolve(module)]
    } catch (e) {
        console.log(e);
    }
    return require(module)
}
var _ = grunt.util._,
    fs = require('fs');

var pathConfig = {
    app: 'app',
    dist: 'dist',
    tmp: '.tmp',
    test: 'test',
    sass: 'app/styles',
    css: 'app/styles',
    js: 'app/scripts'
};
var connectOpt = {
    options: {
        port: 8000,
        hostname: '*'
    },
    server: {
        options: {
            livereload: 35722,
            middleware: function(connect) {
                return [
                    function fakeDataMiddleware(req, res, next) {
                        _.each(requireUncached('./mock/config'), function(data, url) {
                            var method = url.split(' ')[0];
                            var path = new RegExp(url.split(' ')[1]);

                            if (req.method === method && path.test(req.url)) {
                                if (_.isFunction(data)) {
                                    data = data(req);
                                }
                                res.writeHead(200, {
                                    'Content-Type': 'application/json; charset=utf-8'
                                });
                                res.end(JSON.stringify(data), 'utf8');
                            }
                        });
                        next();
                    },
                    require('grunt-connect-proxy/lib/utils').proxyRequest,
                    lrSnippet,
                    require('connect-modrewrite')([]),
                    mountFolder(connect, pathConfig.tmp),
                    mountFolder(connect, pathConfig.app)
                ];
            },
            open: true,
            useAvailablePort: true
        },
        proxies: [{
            context: '/api/v1/tool/ua',
            host: 'apps-datatools0-bgp0.hy01.wandoujia.com',
            port: 4000,
            rewrite: {
                '^/api/v1/tool/ua': ''
            },
            changeOrigin: true,
            headers: {
                cookie: 'sso_session_id=af4cb0a8f5f015705877b8f0d0c7f77a'
            }
        }, {
            context: '/api/v1',
            host: 'muce3.wandoulabs.com',
            changeOrigin: true,
            headers: {
                cookie: 'sso_session_id=c1a10025455fd410b348b3a142f6bc1a'
            }
        }]
    }
};

module.exports = function(grunt) {
    require('time-grunt')(grunt);
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var configOpts = {
        paths: pathConfig,
        clean: {
            dist: ['<%= paths.tmp %>', '<%= paths.dist %>'],
            server: '<%= paths.tmp %>'
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= paths.app %>',
                    dest: '<%= paths.dist %>',
                    src: [
                        '**/*'
                    ]
                }]
            },
            index: {
                files: {
                    'dist/index.html': 'app/index.html'
                }
            },
            static: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= paths.app %>',
                    dest: '<%= paths.dist %>',
                    src: [
                        'font/**/*', 'images/**/*', 'assets/**/*'
                    ]
                }]
            },
            vendor: {
                files: [{
                    expand: true,
                    // dot: true,
                    flatten: true,
                    cwd: '<%= paths.app %>/vendors',
                    dest: '<%= paths.dist %>/font',
                    src: ['ace-v1.2/font/**/*']
                }]
            }
        },

        useminPrepare: {
            html: ['dist/index.html'],
            options: {
                dest: 'dist',
                root: 'app'
            }
        },
        usemin: {
            html: ['dist/index.html'],
            css: ['.tmp/styles/**/*.css'],
            options: {
                dirs: ['dist'],
                assetsDirs: ['dist']
            }
        },
        htmlmin: {
            options: {
                collapseWhitespace: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: ['**/*.html'],
                    dest: 'dist'
                }]
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dist/images',
                    src: '**/*.{png,jpg,jpeg}',
                    dest: 'dist/images'
                }]
            }
        },

        ngAnnotate: {
            options: {
                singleQuotes: true,
            },
            dist: {
                src: '.tmp/concat/scripts/app.js'
            }
        },
        filerev: {
            assets: {
                src: [
                    '<%= paths.dist %>/**/*',
                    '!<%= paths.dist %>/index.html'
                ],
                filter: 'isFile'
            }
        },
        requirejs: {
            options: {
                appDir: '<%= paths.app %>/scripts',
                baseUrl: './',
                dir: '<%= paths.tmp %>/scripts',
                optimize: 'none'
            },
            dist: {
                options: {
                    modules: [{
                        name: 'index'
                    }],
                    almond: true,
                    replaceRequireScript: [{
                        files: ['dist/index.html'],
                        module: 'index'
                    }]
                }
            }
        },
        connect: connectOpt,

        watch: {
            compass: {
                files: ['<%= paths.app %>/styles/**/*'],
                tasks: ['compass:dev']
            }
        },
        compass: {
            options: {
                importPath: '<%= paths.app %>/components',
                sassDir: '<%= paths.sass %>',
                cssDir: '<%= paths.css %>',
                imagesDir: '<%= paths.app %>/images',
                generatedImagesDir: '<%= paths.tmp %>/images',
                httpImagesPath: '../images',
                httpGeneratedImagesPath: '../images',
            },
            dev: {
                options: {
                    assetCacheBuster: true
                }
            },
            dist: {
                options: {
                    assetCacheBuster: false
                }
            }
        },

        concurrent: {
            server: {
                tasks: ['clean:server', 'compass:server'],
                options: {
                    logConcurrentOutput: true
                }
            },
            dist: {
                tasks: ['copy:compass', 'compass:dist'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            test: ['<%= paths.js %>/**/*.js', '!<%= paths.js %>/vendor/**/*']
        },
        removelogging: {
            dist: {
                src: '.tmp/concat/scripts/**/*.js'
            }
        },

        ngtemplates: {
            app: {
                src: 'app/templates/**/*.html',
                dest: 'app/scripts/templates.js',
                options: {
                    bootstrap: function(module, script) {
                        return "(function() { angular.module('muceApp.templates', []).run(['$templateCache'," + "function($templateCache) {" + script + "}]);})();";
                    },
                    url: function(url) {
                        return url.replace(/^app\//, '');
                    }
                }
            }
        }
    };

    grunt.initConfig(configOpts);

    grunt.registerTask('serve', [
        'compass:dev',
        'configureProxies:server',
        'connect:server',
        'watch'
    ]);

    grunt.registerTask('test', [
        'jshint:test'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'compass:dist',
        'copy:index',
        'ngtemplates',
        'requirejs',
        'useminPrepare',
        'concat',
        'removelogging',
        'ngAnnotate',
        'cssmin',
        'uglify',
        'filerev',
        // 'imagemin',
        'usemin',
        'copy:static',
        'copy:vendor'
    ]);

    grunt.registerTask('build:staging', [
        'build'
    ]);

    grunt.registerTask('build:production', [
        'build'
        // add aws_s3 upload
    ]);
};