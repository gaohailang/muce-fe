module.exports = function(grunt) {

    grunt.registerTask('serve', [
        'compass:dev',
        'configureProxies:server',
        'connect:server',
        'watch'
    ]);

    grunt.registerTask('test', [
        'jshint:test'
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

    grunt.registerTask(['update'], [
        'bump-only:patch',
        'changelog',
        'bump-commit'
    ]);

    grunt.registerTask(['update:minor'], [
        'bump-only:minor',
        'changelog',
        'bump-commit'
    ]);

    grunt.registerTask(['update:major'], [
        'bump-only:major',
        'changelog',
        'bump-commit'
    ]);

    return grunt;
}