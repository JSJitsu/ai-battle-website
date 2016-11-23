const gulp = require('gulp');
const sass = require('gulp-sass');
const spa = require("gulp-spa");
const uglify = require('gulp-uglify');
const cleanCss = require('gulp-clean-css');
const concat = require('gulp-concat');
const rev = require('gulp-rev');
const rename = require('gulp-rename');

gulp.task('sass', function () {
    return gulp.src('./public/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./public/css'));
});

gulp.task('build', ['sass'], function () {
    return gulp.src("./public/dev.html")
        .pipe(spa.html({
            assetsDir: './public/',
            pipelines: {
                main: function (files) {
                    return files
                        .pipe(rename(function (path) {
                            path.basename = 'index';
                        }));
                },
                js: function (files) {
                    return files
                        .pipe(uglify())
                        .pipe(concat('build/app.js'))
                        .pipe(rev());
                },
                css: function (files) {
                    return files
                        .pipe(cleanCss())
                        .pipe(concat('build/app.css'))
                        .pipe(rev());
                }
            }
        }))
        .pipe(gulp.dest('./public/'));
});

gulp.task('sass:watch', function () {
    gulp.watch('./public/sass/**/*.scss', ['sass']);
});