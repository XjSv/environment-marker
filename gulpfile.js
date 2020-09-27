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
let autoprefixer = require('autoprefixer');
let postcss = require('gulp-postcss');
let cssnano = require('cssnano');
let merge = require('merge-stream');

// JS function
function js() {
    let environment_marker_js_source = './popup/environment-marker.js';
    let environment_marker_js = src(environment_marker_js_source)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest('./popup/'));

    let background_js_source = './js/background.js';
    let background_js = src(background_js_source)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest('./js/'));

    let content_js_source = './js/content.js';
    let content_js = src(content_js_source)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest('./js/'));

    return merge(environment_marker_js, background_js, content_js);
}

// CSS function
function css() {
    let environment_marker_scss_source = './popup/environment-marker.scss';
    let environment_marker_scss = src(environment_marker_scss_source)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer,
            cssnano
        ]))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest('./popup/'));

    let content_scss_source = './css/content.scss';
    let content_scss = src(content_scss_source)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer,
            cssnano
        ]))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest('./css/'));

    return merge(environment_marker_scss, content_scss);
}

// Watch files
function watchFiles() {
    watch('./popup/environment-marker.scss', css);
    watch('./popup/environment-marker.js', js);
    watch('./css/content.scss', css);
    watch('./js/background.js', js);
    watch('./js/content.js', js);
}

exports.default = series(parallel(js, css), watchFiles);
