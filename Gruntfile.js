var rework_import = require('rework-import');
var rework_vars = require('rework-vars');
var rework_at2x = require('rework-plugin-at2x');
var fs = require('fs');
var logo = fs.readFileSync('./static/img/logo_transparent.svg', 'utf8');

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
      styles: {
        files: ['static/styl/**/*.styl', 'static/styl/**/*.css'],
        tasks: ['rework:dev', 'autoprefixer:all'],
        options: {}
      },
      live: {
        // Here we watch the files the sass task will compile to
        // These files are sent to the live reload server after sass compiles to them
        files: ['build/static/css/**/*.css'],
        tasks: ['shell:noop'],
        options: {
          livereload: true
        }
      },
      markup: {
        files: [
          'templates/**/*.html', 'templates/**/*.hbs',
          'src/**/*.html', 'src/**/*.md', 'src/**/*.html',
          'metalsmith.json'
        ],
        tasks: ['clean', 'shell:metalsmith', 'replace:logo', 'browserify:dev', 'replace:dev', 'rework:dev', 'autoprefixer:all', 'copy:img'],
        options: {
          spawn: false,
          atBegin: true
        }
      }
    },
    shell: {
      metalsmith: {
        command: 'node_modules/.bin/metalsmith'
      },
      noop: {
        command: 'echo "live reloaded."'
      },
      serve: {
        command: 'serve -f build/favicon.ico build'
      },
      deploy: {
        command: 'rsync -avrc build slex@tipsy.io:/var/www/vintageheart.coffee',
        options: {
          stdout: true
        }
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
    rework: {
      options: {
        use: [
          rework_vars(),
          rework_import({
            path: [
                'static/styl/vendor',
                'node_modules',
            ]
          }),
          rework_at2x()
        ]
      },
      dev: {
        files: {
          'build/static/css/<%= pkg.name %>.css': 'static/styl/<%= pkg.name %>.styl'
        }
      },
      prod: {
        options: {
          toString: {
            compress: true
          }
        },
        files: {
          'build/static/css/<%= pkg.name %>.css': 'static/styl/<%= pkg.name %>.styl'
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
      },
      logo: {
        options: {
          patterns: [
            {
              match: /__SVGLOGO__/g,
              replacement: logo
            }
          ]
        },
        files: [{
          src: ['build/index.html'],
          dest: 'build/index.html'
        }]
      }
    },
    copy: {
      img: {
        src: ['static/img/**/*.svg', 'static/img/**/*.jpg','static/img/**/*.png'],
        dest: 'build/'
      }
    },
    autoprefixer: {
      options: {},
      all: {
        src: 'build/static/css/<%= pkg.name %>.css',
        dest: 'build/static/css/<%= pkg.name %>.css'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-rework');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-replace');

  grunt.registerTask('default', [
    'clean',
    'shell:metalsmith',
    'replace:logo',
    'jshint',
    'browserify:prod',
    'uglify:build',
    'rework:prod',
    'autoprefixer:all',
    'copy:img'
  ]);
  grunt.registerTask('build', ['default']);

  grunt.registerTask('serve', ['shell:serve']);
  grunt.registerTask('deploy', ['build', 'shell:deploy']);
};
