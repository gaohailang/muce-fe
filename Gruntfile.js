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
    css: '.tmp/styles',
    js: 'app/scripts'
};
var connectOpt = {
    options: {
        port: 9000,
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
            context: '/api/v1',
            host: 'muce3.wandoulabs.com',
            changeOrigin: true,
            headers: {
                cookie: 'sso_session_id=bbdef3f7420ae1de9379f3fb38383e6d'
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
            templates: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= paths.app %>/templates',
                    dest: '<%= paths.dist %>/templates',
                    src: [
                        '**/*'
                    ]
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
                src: '.tmp/scripts/index.js'
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
                dest: 'dist/scripts/templates.js',
                options: {
                    // bootstrap: function(module, script) {
                    //     return 'define(module, [], function() { return { init: ' + script + ' }; });';
                    // },
                    // htmlmin: {
                    //     collapseWhitespace: true,
                    //     collapseBooleanAttributes: true
                    // },
                    module: 'muceApp'
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
        'requirejs',
        'ngAnnotate',
        'useminPrepare',
        'concat',
        'removelogging',
        'cssmin',
        'uglify',
        'filerev',
        // 'imagemin',
        'usemin',
        'copy:templates'
    ]);

    grunt.registerTask('build:staging', [
        'clean:dist',
        'concurrent:dist',
        // 'ngAnnotate',
        // 'useminPrepare',
        // 'concat',
        // 'uglify',
        // 'cssmin', // Uncomment this line if using none-sass style
        // 'requirejs:dist', // Uncomment this line if using RequireJS in your project
        // 'rev',
        'copy:compass',
        // 'imagemin',
        // 'usemin'
        'copy:dist'
    ]);

    grunt.registerTask('build:production', [
        'clean:dist',
        'concurrent:dist',
        // 'ngAnnotate',
        // 'useminPrepare',
        // 'concat',
        // 'uglify',
        // 'cssmin', // Uncomment this line if using none-sass style
        // 'requirejs:dist', // Uncomment this line if using RequireJS in your project
        // 'rev',
        'copy:compass',
        // 'imagemin',
        // 'usemin'
        'copy:dist'
    ]);
};