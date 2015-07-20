'use strict';
var webpack = require('webpack');
try {
  var awsCfg = require('./cfg/aws.json');
} catch (err) {
  console.error('!!ERROR: Missing cfg/aws.json\n');
}
var s3Cfg = require('./cfg/s3.json');
if (s3Cfg.path.charAt(s3Cfg.path.length - 1) !== '/') {
  s3Cfg.path += '/';
}

module.exports = function (grunt) {
  grunt.option('force', true);

  grunt.initConfig({

    connect: {
      server: {
        options: {
          livereload: true,
          useAvailablePort: true,
          hostname: '*',
          base: './build/',
          middleware: function (connect, options, middlewares) {
            middlewares.unshift(function (req, res, next) {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', '*');
              return next();
            });
            return middlewares;
          }
        }
      }
    },

    webpack: {
      options: {
        entry: './src/main.js',
        output: {
          path: './build/js/',
          filename: 'main.js',
          library: 'gv',
          libraryTarget: 'umd'
        },
        module: {
          loaders: [
            { test: /\.(html|txt|css)$/, loader: 'raw-loader' },
            { test: /\.json$/, loader: "json-loader" }
          ]
        }
      },
      deploy: {
        debug: false,
        plugins: [
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              warnings: false,
              drop_console: true,
              dead_code: true,
              drop_debugger: true
            }
          })
        ]
      },
      dev: {
        debug: true,
        devtool: 'cheap-source-map'
      }
    },

    sass: {
      options: {
        sourceMap: true,
        sourceMapContents: true,
        sourceComments: true
      },
      build: {
        files: { 'build/css/main.css': 'src/css/main.scss' }
      }
    },

    postcss: {
      options: {
        map: true,
        processors: [
          require('autoprefixer-core')(),
          require('csswring')
        ]
      },
      dist: {
        src: 'build/css/main.css'
      }
    },

    clean: {
      temp: ['temp/'],
      build: ['build/'],
      unhashed: []
    },

    watch: {
      grunt: { files: ['Gruntfile.js'] },
      boot: {
        files: ['boot/index.html', 'boot/boot.js'],
        tasks: ['build', 'webpack:dev', 'cachebust'],
        options: { livereload: true }
      },
      css: {
        files: 'src/css/**/*.*',
        tasks: ['sass', 'postcss', 'cachebust'],
        options: { livereload: true }
      },
      js: {
        files: ['src/main.js', 'src/js/**/*.js', 'src/html/**/*.html'],
        tasks: ['webpack:dev', 'cachebust'],
        options: { livereload: true }
      },
      data: {
        files: ['src/data/**/*.*'],
        tasks: ['build', 'webpack:dev', 'cachebust'],
        options: { livereload: true }
      },
      imgs: {
        options: { event: ['changed', 'added', 'deleted'], livereload: true },
        files: 'src/imgs/**/*.*',
        tasks: ['build', 'webpack:dev', 'cachebust']
      }
    },

    copy: {
      boot: {
        expand: true,
        cwd: 'boot/',
        src: ['index.html', 'boot.js'],
        dest: 'build/'
      },
      imgs: {
        expand: true, cwd: 'src/', src: 'imgs/*', dest: 'build/'
      },
      data: {
        expand: true, cwd: 'src/', src: 'data/*', dest: 'build/'
      }
    },

    hash: {
      options: {
        mapping: 'temp/assets.json',
        srcBasePath: 'build',
        destBasePath: 'build',
        flatten: false,
        hashLength: 8
      },
      js: { src: 'build/js/**/*.js' },
      css: { src: 'build/css/**/*.css' },
      img: { src: 'build/imgs/**/*.*' },
      data: { src: 'build/data/**/*.*' },
    },

    replace: {
      main: {
        src: ['build/boot.js', 'build/js/*.js', 'build/css/*.css'],
        overwrite: true,
        replacements: [] // see cachebust
      }
    },

    s3: {
      options: {
        access: 'public-read',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || awsCfg.AWSAccessKeyID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || awsCfg.AWSSecretKey,
        bucket: s3Cfg.bucket,
        gzip: true,
        gzipExclude: ['.jpg', '.gif', '.jpeg', '.png']
      },
      base: {
        options: { headers: { CacheControl: 60 } },
        files: [{ cwd: 'build', src: ['*.*'], dest: s3Cfg.path }]
      },
      assets: {
        options: { headers: { CacheControl: 300 } },
        files: [{
          cwd: 'build',
          src: ['js/**/*', 'css/**/*', 'imgs/**/*', 'data/**/*'],
          dest: s3Cfg.path
        }]
      }
    }

  });
  
  // Hash files and replace references
  grunt.registerTask('cachebust', 'hash files, replace reference', function (target) {
    var port;
    if (grunt.file.isFile('./temp/port.json')) {
      port = grunt.file.readJSON('temp/port.json').port;
    } else {
      port = grunt.config.data.connect.server.options.port;
      grunt.file.write('temp/port.json', JSON.stringify({ port: port }));
    }

    var assets = {};
    var toPrefix = '';
    if (target && target === 'deploy') {
      assets = grunt.file.readJSON('temp/assets.json');
      var hashedFiles = Object.keys(assets).map(function (path) { return 'build/' + path; });
      grunt.config.data.clean.unhashed = hashedFiles;
      toPrefix = s3Cfg.domain + s3Cfg.path;
    } else {
      grunt.file.expand('build/{js,imgs,css,data}/**/*.*').forEach(function (path) {
        var newPath = path.replace('build/', '');
        assets[newPath] = newPath;
      });
      toPrefix = 'http://localhost:' + port + '/';
    }

    var repalceFiles = Object.keys(assets).map(function (path) {
      var regEx = new RegExp('([\'"=\(])\W?/' + path, 'g');
      return {
        from: regEx,
        to: '$1' + toPrefix + assets[path]
      };
    });

    grunt.config.data.replace.main.replacements = repalceFiles;
    grunt.task.run('replace');
  });

  require('jit-grunt')(grunt, { s3: 'grunt-aws', replace: 'grunt-text-replace' });

  // Tasks
  grunt.registerTask('build', [
    'clean:build',
    'copy',
    'sass',
    'postcss'
  ]);

  grunt.registerTask('default', [
    'clean',
    'connect',
    'build',
    'webpack:dev',
    'cachebust',
    'watch'
  ]);

  grunt.registerTask('deploy', [
    'build',
    'webpack:deploy',
    'hash',
    'cachebust:deploy',
    'clean:unhashed',
    's3'
  ]);
};