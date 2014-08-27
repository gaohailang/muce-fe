module.exports = {
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
        compass: {
            files: [{
                expand: true,
                dot: true,
                cwd: '<%= paths.tmp %>',
                dest: '<%= paths.dist %>',
                src: [
                    '**/*'
                ]
            }]
        }
    }
};