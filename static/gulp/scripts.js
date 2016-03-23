'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*']
});

var webpack = require('webpack-stream');
var webpackConfig = require('../webpack.config.js');
var merge = require('lodash/merge');
var browserSync = require('./browser-sync');

gulp.task('scripts', function () {

    var config = webpackConfig;
    if (process.env.NEAT_FRONTEND_WATCH) {
        config = merge({}, config, { watch: true });
    }

    return gulp.src('src/main.js')
               .pipe($.plumber())
               .pipe(webpack(config))
               .on('error', console.error.bind(console))
               .pipe(gulp.dest('dist'))

               // pass changes to browserSync
               // if browserSync not running this is a no-op
               .on('end', browserSync.reload);

});
