module.exports = {
    useminPrepare: {
        html: ['<%= paths.app %>/**/*.html'],
        options: {
            dest: '<%= paths.dist %>'
        }
    },
    usemin: {
        html: ['<%= paths.dist %>/**/*.html'],
        css: ['<%= paths.dist %>/stylesheets/**/*.css'],
        options: {
            dirs: ['<%= paths.dist %>'],
            assetsDirs: ['<%= paths.dist %>']
        }
    },
    htmlmin: {
        options: {
            collapseWhitespace: true
        },
        dist: {
            files: [{
                expand: true,
                cwd: '<%= paths.dist %>',
                src: ['**/*.html'],
                dest: '<%= paths.dist %>'
            }]
        }
    },
    imagemin: {
        dist: {
            files: [{
                expand: true,
                cwd: '<%= paths.dist %>/images',
                src: '**/*.{png,jpg,jpeg}',
                dest: '<%= paths.dist %>/images'
            }]
        }
    }
};