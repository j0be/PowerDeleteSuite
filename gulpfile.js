var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');

gulp.task('sass', function () {
    return gulp.src('app.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS())
        .pipe(gulp.dest('./css'));
});

gulp.task('sass:watch', function () {
    return gulp.watch('app.scss', gulp.parallel('sass'));
});

gulp.task('default', gulp.parallel('sass:watch'));