
var gulp            = require('gulp');
var autoprefixer    = require('autoprefixer');
var cleanCSS        = require('gulp-clean-css');
var del             = require('del');
var notify          = require('gulp-notify');
var plumber         = require('gulp-plumber');
var postcss         = require('gulp-postcss');
var rename          = require('gulp-rename');
var runSequence     = require('run-sequence');
var sass            = require('gulp-sass');
var scsslint        = require('gulp-scss-lint');
var sourcemaps      = require('gulp-sourcemaps');
var uglify          = require('gulp-uglify');



// ---------- Task to Lint Sass files
gulp.task('scss-lint', function() {

    gulp.src(['src/sass/**/*.scss', '!src/sass/utils/**/*.scss', '!src/sass/base/_reset.scss']) // Toggle for basic Sass project
    // gulp.src(['src/sass-app/**/*.scss', '!src/sass-app/core-styles/base/_reset.scss', '!src/sass-app/core-styles/utils/**/*.scss, !src/sass-app/app/utils/**/*.scss'])    // Toggle for large Sass app
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(scsslint({'config': '.scss-lint.yml'}))
        .pipe(scsslint.failReporter())
});



// ---------- Task for compiling Sass into CSS
gulp.task('styles', function() {
    var processors = [
        autoprefixer({browsers: ['last 3 versions']})
    ];

    gulp.src('src/sass/style.scss')    // Toggle for basic Sass project
    // return gulp.src('src/sass-app/app.scss')    // Toggle for large Sass app
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write())
        .pipe(postcss(processors))
        .pipe(gulp.dest('dist/css'))

        .pipe(cleanCSS())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest('dist/css'))
        .pipe(notify("Sass Compiled! ( <%= file.relative %> )"))
});



// ---------- Task for compiling and modifying scripts
gulp.task('scripts', function() {
    gulp.src('src/js/**/*.js')
        .pipe(gulp.dest('dist/js'))
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest('dist/js'))
        .pipe(notify("JavaScript Compiled! ( <%= file.relative %> )"))
});



// ---------- Tasks to clean out the build directory
gulp.task('clean:css',function() {
    return del([
        'dist/css/**/*',
    ]);
});
gulp.task('clean:js',function() {
    return del([
        'dist/js/**/*'
    ]);
});



// ---------- Watch Gulp files for changes
gulp.task('watch', function() {
    gulp.watch('src/sass/**/*', ['scss-lint', 'clean:css', 'styles']);        // Toggle for basic Sass project
    // gulp.watch('src/sass-app/**/*', ['clean:css', 'styles']);    // Toggle for large Sass app
    gulp.watch('src/js/*', ['clean:js', 'scripts']);
});



// ---------- Default task
gulp.task('default', function() {
    runSequence('clean:css', 'clean:js', ['scripts', 'styles', 'watch']);
});
