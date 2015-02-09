var gulp = require('gulp'),
    browserify = require('gulp-browserify')
    jasmine = require('gulp-jasmine'),
    concat = require('gulp-concat');

gulp.task('concat', function() {
  gulp.src(['lib/*.js'])
    .pipe(concat('g.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('test', function() {
  gulp.src(['test/*.js'])
    .pipe(jasmine());
});

gulp.task('watch', function() {
  // gulp.watch(['lib/*.js', 'test/*.js'], ['test']);
  gulp.watch(['lib/*.js', 'js/game.js'], ['build']);
});

gulp.task('build', function() {
  gulp.src('js/game.js')
    .pipe(browserify())
    .pipe(gulp.dest('./dist'))
});

gulp.task('default', ['test', 'build']);
