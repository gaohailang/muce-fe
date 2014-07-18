module.exports = function(grunt) {

    var _ = grunt.util._,
        fs = require('fs');
    // configurable paths
    var pathConfig = {
        app: 'app',
        dist: 'dist',
        tmp: '.tmp',
        test: 'test',
        sass: 'app/styles',
        css: '.tmp/styles',
        js: 'app/scripts'
    };

    // load outside config blocks
    var configOpts = {};
    _.each(fs.readdirSync('grunt'), function(file) {
        if (!~['config.js', '_tasks.js'].indexOf(file)) {
            _.extend(configOpts, require('./' + file));
        }
    });

    // short task config defined here
    _.extend(configOpts, {
        paths: pathConfig,
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= paths.dist %>/javascripts/**/*.js',
                        '<%= paths.dist %>/stylesheets/**/*.css',
                        '<%= paths.dist %>/images/**/*.{webp,gif,png,jpg,jpeg,ttf,otf}'
                    ]
                }
            }
        },
        requirejs: {
            dist: {
                options: {
                    optimize: 'uglify',
                    uglify: {
                        toplevel: true,
                        ascii_only: false,
                        beautify: false
                    },
                    preserveLicenseComments: true,
                    useStrict: false,
                    wrap: true
                }
            }
        }
    });

    grunt.initConfig(configOpts);

    return grunt;
};