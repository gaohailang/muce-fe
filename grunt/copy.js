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
                    '**/*.html',
                    '!components/**/*.html',
                    '!compass/**/*.html',
                    'images/**/*.{webp,gif,png,jpg,jpeg,ttf,otf,svg}'
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
                    'images/**/*.{webp,gif,png,jpg,jpeg,ttf,otf,svg}'
                ]
            }]
        }
    }
};