'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*']
});

gulp.task('fonts', function() {
    return gulp.src([
        'dist/lib/bootstrap-stylus/fonts/*.{svg,ttf,otf,woff,woff2}',
        'dist/lib/font-awesome/fonts/*.{svg,ttf,otf,woff,woff2}',
        'src/modules/**/fonts/*.{svg,ttf,otf,woff,woff2}'])
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'));
});