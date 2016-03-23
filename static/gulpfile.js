'use strict';

var gulp = require('gulp');
var del = require('del');

require('require-dir')('./gulp');

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});

gulp.task('clean', function(cb) {
  del([
    'dist/modules/**/*',

    // Annoying thing you have to do to prevent a single file from being
    // deleted, ugh. https://github.com/sindresorhus/del#beware
    '!dist/modules/reports',
    '!dist/modules/reports/utils',
    '!dist/modules/reports/utils/query-manifest.json',
    'dist/*.js'
  ], cb);
});

gulp.task('build', ['styles', 'scripts', 'fonts', 'create-reports', 'build-report-list']);