'use strict';

var gulp = require('gulp');

gulp.task('watch', ['build'], function () {
  gulp.watch('src/**/*.js', ['scripts']);
  gulp.watch('src/**/*.styl', ['styles']);
});
