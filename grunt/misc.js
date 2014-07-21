module.exports = {
    bowerInstall: {
        target: {
            src: ['app/index.html']
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
            tasks: ['copy:dist', 'compass:dist'],
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
    bump: {
        options: {
            files: ['package.json', 'bower.json'],
            updateConfigs: [],
            commit: true,
            commitMessage: 'Release v%VERSION%',
            commitFiles: ['-a'],
            createTag: true,
            tagName: 'v%VERSION%',
            tagMessage: 'Version %VERSION%',
            push: false
        }
    },
    cdn: {
        options: {
            cdn: 'http://change.this.to.cdn.path',
            flatten: true
        },
        dist: {
            src: ['<%= paths.dist %>/**/*.html', '<%= paths.dist %>/**/*.css'],
        }
    }
};