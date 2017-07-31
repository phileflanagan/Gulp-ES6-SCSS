var gulp           = require('gulp');
var browserSync    = require('browser-sync');
var sass           = require('gulp-sass');
var prefix         = require('gulp-autoprefixer');
var plumber        = require('gulp-plumber');
var notify         = require('gulp-notify');
var uglify         = require('gulp-uglify');
var rename         = require('gulp-rename');
var babel          = require('gulp-babel');
var autopolyfiller = require("gulp-autopolyfiller");
var concat         = require("gulp-concat");
var order          = require("gulp-order");
var merge          = require("event-stream").merge;

//Static Server + watching scss/html files
gulp.task('serve', ['sass', 'js'], function() {
    browserSync.init({
        server: './dist/'
    });
    gulp.watch("./src/sass/**/*.scss", ['sass']);
    gulp.watch("./src/javascript/index.js", ['js']);
    gulp.watch("./dist/*.html").on('change', browserSync.reload);
});

//Compile Sass/SCSS into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src("./src/sass/**/*.scss")
      .pipe(plumber({
        errorHandler: function(error) {
          notify().write({
            title: 'Gulp: SCSS',
            message: error.message
          });
          console.log(error.message);
          browserSync.notify(error.message);
          this.emit('end');
        }
      }))
      .pipe(sass())
      .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
        cascade: true
       }))
      .pipe(gulp.dest('./dist/assets/stylesheets/'))
      .pipe(browserSync.reload({stream: true}));
});

//Compile and Minify JavaScript
gulp.task('js', function() {
    var all = gulp.src('./src/javascript/**/*.js')
       .pipe(order([
         'vendor/**/*.js',
         'app/**/*.js',
         'index.js'
       ]))
       .pipe(concat('all.js'))
       .pipe(babel({
         presets: ['es2015'],
         compact: false
       }))
    var polyfills = all
       .pipe(autopolyfiller('polyfills.js'));

    return merge(polyfills, all)
       .pipe(order([
         'polyfills.js',
         'all.js'
       ]))
      .pipe(concat('all.min.js'))
      .pipe(uglify())
      .pipe(rename('index.min.js'))
      .pipe(gulp.dest('./dist/assets/javascript/'))
      .pipe(browserSync.reload({stream: true}));
});

gulp.task('default', ['serve']);
