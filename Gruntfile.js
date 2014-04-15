module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'build/static/js/<%= pkg.name %>.js',
        dest: 'build/static/js/<%= pkg.name %>.js'
      }
    },
    jshint: {
      files: [
        'Gruntfile.js',
        'static/js/**/*.js'
      ]
    },
    clean: ['build'],
    watch: {
      scripts: {
        files: ['static/js/**/*.js'],
        tasks: ['jshint', 'browserify:dev', 'replace:dev'],
        options: {
          spawn: false
        }
      },
      markup: {
        files: [
          'templates/**/*.html', 'templates/**/*.hbs',
          'src/**/*.html', 'src/**/*.md', 'src/**/*.html'
        ],
        tasks: ['clean', 'shell:metalsmith', 'browserify:dev', 'replace:dev'],
        options: {
          spawn: false
        }
      }
    },
    shell: {
      metalsmith: {
        command: 'node_modules/.bin/metalsmith'
      }
    },
    browserify: {
      dev: {
        src: 'static/js/<%= pkg.name %>.js',
        dest: 'build/static/js/<%= pkg.name %>.js',
        options: {
          watch: true,
          bundleOptions: {
            debug: true
          }
        }
      },
      prod: {
        src: 'static/js/<%= pkg.name %>.js',
        dest: 'build/static/js/<%= pkg.name %>.js',
        options: {
          bundleOptions: {
            debug: false
          }
        }
      }
    },
    replace: {
      dev: {
        options: {
          patterns: [
            {
              match: /;$/,
              replacement: ''
            }
          ]
        },
        files: [{
          src: ['build/static/js/<%= pkg.name %>.js'],
          dest: 'build/static/js/<%= pkg.name %>.js'
        }]
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-replace');

  grunt.registerTask('default', [
    'clean',
    'shell:metalsmith',
    'jshint',
    'browserify:prod',
    'uglify:build'
  ]);
   grunt.registerTask('build', ['default']);
};
