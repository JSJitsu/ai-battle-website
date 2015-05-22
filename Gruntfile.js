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
          './public/css/main.css': './public/scss/main.scss'
        }
      }
    },
    concat: {
       options:{
        separator: ';'
      },
      js: {
        src:
          [
            'public/lib/jquery-ui/jquery-ui.min.js',
            'public/lib/bootstrap/dist/js/bootstrap.min.js',
            'public/lib/powerange/dist/powerange.min.js',
            'public/ejs_templates/ejs/ejs_production.js',
            'public/js/**/*.js',
            'public/app.js'
          ],
        dest: 'public/dist/<%= pkg.name %>.js'
      }
    },
    cssmin: {
      minify: {
        files: {
         'public/dist/main.min.css' : ['public/css/main.css']
        }
      }
    },
    uglify: {
      dist: {
        src: 'public/dist/<%= pkg.name %>.js',
        dest: 'public/dist/<%= pkg.name %>.min.js'
      }
    },
    clean: {
      build: {
        src: ['public/dist/<%= pkg.name %>.js']
      }
    },
    watch: {
      files: [
        './public/scss/*.scss',
        './public/js/**/*.js',
        './public/css/*.css'
      ],
      tasks: [
        'sass',
        'concat',
        'uglify',
        'cssmin',
        'clean'
      ]
    }
  });


  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // grunt.loadNpmTasks('grunt-blanket');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-cssmin');


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
  ]);
  grunt.registerTask('local', ['jshint', 'test', 'nodemon']);


  grunt.registerTask('default', ['concat', 'uglify', 'sass', 'cssmin', 'clean']);


  // grunt.registerTask('upload', function(n) {
  //   if(grunt.option('prod')) {
  //     grunt.task.run([ 'build' ]);
  //   } else {
  //     grunt.task.run([ 'server-dev' ]);
  //   }
  // });

};
