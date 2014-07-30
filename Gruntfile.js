module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    

  concat: {
    //   options: { separator: ';'},
    //   lib:{
    //     src: [

    //     ],
    //     // dest: 'public/dist/lib.js',
    //   },
    //   dist: {
    //     src: [
    //       'public/client/*.js'
    //     ],
    //     dest: 'public/dist/production.js',
    //   },
      // dist: {
      //     src: [
      //         'js/libs/*.js', // All JS in the libs folder
      //         'js/global.js'  // This specific file
      //     ],
      //     dest: 'js/build/production.js',
      // }
      //todod
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      // build:{
      //   src: 'public/dist/production.js',
      //   dest: 'public/dist/production.min.js'
      // },
      // lib:{
      //   src: 'public/dist/lib.js',
      //   dest: 'public/dist/lib.min.js',

      // },
    },

    jshint: {
      files: [
        // Add filespec list here
        // 'public/dist/production.js'
        // 'public/client/*.js'
        'server.js'
      ],
      options: {
        // with force 'true' will continue to run next grunt procesees if fails
        // force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          // 'public/lib/**/*.js',
          // 'public/dist/**/*.js'
        ]
      }
    },

    cssmin: {
    },

    watch: {
      scripts: {
        files: [
          'public/lib/underscore.js',
          'public/lib/jquery.js',
          'public/lib/backbone.js',
          'public/lib/handlebars.js',
          'public/client/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
        command: 'git push azure master'
      }
    },
  });

  // grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // grunt.loadNpmTasks('grunt-contrib-watch');
  // grunt.loadNpmTasks('grunt-contrib-concat');
  // grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-mocha-test');
  // grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    // grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('default', ['jshint', 'test', 'nodemon']);


  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('build', [
    'shell:prodServer'
  ]);

  grunt.registerTask('upload', function(n) {
    if(grunt.option('prod')) {
      // add your production server task here
      grunt.task.run([ 'build' ]);
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', ['jshint', 'test', 'nodemon', 'concat', 'uglify', 'upload'
  ]);


};
