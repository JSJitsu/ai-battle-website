module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/spec/ServerSpec.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    jshint: {
      files: [
        'public/scripts/*.js',
        'server.js'
      ],
      options: {
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/**/*.js',
        ]
      }
    },

    sass: {
      dist: {
        options: {
          noCache: true
        },
        files: {
          './public/styles/style.css': './public/scss/style.scss'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-sass');

  // grunt.registerTask('server-dev', function (target) {
  //   // Running nodejs in a different process and displaying output on the main console
  //   var nodemon = grunt.util.spawn({
  //        cmd: 'grunt',
  //        grunt: true,
  //        args: 'nodemon'
  //   });
  //   nodemon.stdout.pipe(process.stdout);
  //   nodemon.stderr.pipe(process.stderr);

  //   // grunt.task.run([ 'watch' ]);
  // });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('build', [
    'sass'
  ]);
  grunt.registerTask('local', ['jshint', 'test', 'nodemon']);


  grunt.registerTask('default', ['build']);


  // grunt.registerTask('upload', function(n) {
  //   if(grunt.option('prod')) {
  //     grunt.task.run([ 'build' ]);
  //   } else {
  //     grunt.task.run([ 'server-dev' ]);
  //   }
  // });

};
