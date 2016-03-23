var gulp        = require('gulp');
var browserSync = require('browser-sync').create();


gulp.task('browser-sync', ['watch'], function() {
  browserSync.init({
    proxy: 'localhost:8095'
  });
});

// export so other tasks can reference this browserSync instance
module.exports = browserSync;