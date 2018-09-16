const gulp = require('gulp');
var concat = require('gulp-concat');

//docs of jsdoc : http://www.css88.com/doc/jsdoc/about-configuring-jsdoc.html
var jsdoc = require('gulp-jsdoc3');

gulp.task('doc', function (cb) {
    gulp.src(['README.md', './src/**/*.js'], {read: false})
        .pipe(jsdoc(cb));
});

gulp.task('watch', function(){
    gulp.watch('./src/**/*.js', ['doc']);
});

gulp.task('default', ['watch']);