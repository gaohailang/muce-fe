module.exports = function(grunt) {
    // log task running time
    require('time-grunt')(grunt);

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // get config
    require('./grunt/config')(grunt);

    // get tasks
    require('./grunt/_tasks')(grunt);

    return grunt;
};