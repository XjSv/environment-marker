const {
    src,
    dest,
    parallel,
    series,
    watch
} = require('gulp');

// Load plugins
let uglify = require('gulp-uglify-es').default;
let rename = require('gulp-rename');
let sass = require('gulp-sass');
let sourcemaps = require('gulp-sourcemaps')
let autoprefixer = require('gulp-autoprefixer');
let cssnano = require('gulp-cssnano');

// JS function
function js() {
    let source = './popup/environment-marker.js';

    return src(source)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write())
        .pipe(dest('./popup/'));
}

// CSS function
function css() {
    let source = './popup/environment-marker.scss';

    return src(source)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(cssnano())
        .pipe(sourcemaps.write())
        .pipe(dest('./popup/'));
}

// Watch files
function watchFiles() {
    watch('./popup/environment-marker.scss', css);
    watch('./popup/environment-marker.js', js);
}

exports.default = series(parallel(js, css), watchFiles);
