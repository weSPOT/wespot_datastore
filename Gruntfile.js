module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        copy: {
            build: {
                cwd: '.',
                src: [ 'node_modules/**','!node_modules/posix', 'routes/**','package.json' ,'server2.js'],
                dest: 'build',
                expand: true
            },
        },

        scp: {
            options: {
                host: 'dali.cs.kuleuven.be',
                port: '2222',
                username: 'ariadne'
            },
            your_target: {
                files: [{
                    cwd: 'build',
                    src: '**/*',
                    filter: 'isFile',
                    // path on the server
                    dest: '/home/ariadne/node-apps/<%= pkg.name %>/<%= pkg.version %>'
                }]
            },
        }

    });

    // load plugins
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-scp');

    // register tasks
   // grunt.registerTask('test', ['jshint', 'qunit']);
    //grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
//    grunt.registerTask('default', ['jshint','concat', 'uglify', 'wiredep']);
    grunt.registerTask('build', ['copy','scp'])
};