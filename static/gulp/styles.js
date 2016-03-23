'use strict';

var gulp = require('gulp');
var nib = require('nib');
var autoprefixer = require('autoprefixer');
var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*']
});

var browserSync = require('./browser-sync');

gulp.task('bootstrap-stylus', function() {
    return gulp.src('src/modules/global-styles/bootstrap-custom.styl')
        .pipe($.newer('dist/styles/bootstrap-custom.css'))
        .pipe($.stylus({
            use: [nib()],
            errors: true,
            linenos: true,
            compress: false,
            include: ['src/modules/global-styles/', 'dist/lib/bootstrap-stylus/']
        }))
        .pipe(gulp.dest('dist/styles'));
});

gulp.task('styles', ['bootstrap-stylus'], function() {

    var processors = [
        autoprefixer({ browsers: 'last 2 versions', cascade: false }),
    ];

    return gulp.src('src/modules/*/styles/*.styl')
    .pipe($.plumber())
    .pipe($.newer('dist/styles/main.css'))
    .pipe($.order([
        '**/*vars.styl',
        'src/**/*.styl']))
    .pipe($.concat('main.styl'))
    .pipe($.stylus({
        errors: true,
        "hoist atrules": true,
        include: ['src/modules/global-styles/']
    }))
    .pipe($.postcss(processors))
    .pipe(gulp.dest('dist/styles'))

    // pass changes to browserSync
    // if browserSync not running this is a no-op
    .pipe(browserSync.stream());
});
