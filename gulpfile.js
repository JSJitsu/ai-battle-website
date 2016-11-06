let gulp = require('gulp');
let sass = require('gulp-sass');
let spa = require("gulp-spa");
let uglify = require('gulp-uglify');
let cleanCss = require('gulp-clean-css');
let concat = require('gulp-concat');
let rev = require('gulp-rev');
let rename = require('gulp-rename');

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