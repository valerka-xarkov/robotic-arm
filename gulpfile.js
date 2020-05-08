var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');
var browserify = require("browserify");
var tsify = require("tsify");
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var fancy_log = require('fancy-log');
var babelify = require('babelify');

var paths = {
  pages: ['src/*.html']
};
const dest = '../back-end/public';

gulp.task('copy-html', function () {
  return gulp.src(paths.pages)
    .pipe(gulp.dest(dest));
});

var watchedBrowserify = watchify(browserify({
  basedir: '.',
  debug: true,
  entries: ['src/ts/main.ts'],
  cache: {},
  packageCache: {}
}).plugin(tsify));


function bundle() {
  return watchedBrowserify
    .transform(babelify.configure({
      presets: ["es2015"]
    }))
    .bundle()
    .on('error', fancy_log)
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(dest));
}

gulp.task('scripts1', function () {
  return tsProject.src()
    .pipe(tsProject())
    .js.pipe(gulp.dest(dest));
});


gulp.task('default', gulp.series(gulp.parallel('copy-html'), bundle));
watchedBrowserify.on('update', bundle);
watchedBrowserify.on('log', fancy_log);
