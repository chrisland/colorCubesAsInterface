module.exports = function(grunt) {


    grunt.initConfig({
        nwjs: {
            options: {
                version: '0.14.4',
                platforms: ['win'],
                buildDir: './release', // Where the build version of my NW.js app is saved
            },
            src: ['./www/**/*'] // Your NW.js app
        },
    });

    grunt.loadNpmTasks('grunt-nw-builder');

    // Default task(s).
    grunt.registerTask('default', ['nwjs']);

};
