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
let sass = require('gulp-sass')(require('sass'));
let sourcemaps = require('gulp-sourcemaps')
let autoprefixer = require('autoprefixer');
let postcss = require('gulp-postcss');
let cssnano = require('cssnano');
let merge = require('merge-stream');

// JS function
function js() {
    let environment_marker_js = src('./popup/environment-marker.js')
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest('./popup/'));

    let options_js = src('./options/options.js')
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest('./options/'));

    let background_js = src('./js/background.js')
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest('./js/'));

    let content_js = src('./js/content.js')
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest('./js/'));

    return merge(environment_marker_js, options_js, background_js, content_js);
}

// CSS function
function css() {
    let environment_marker_scss = src('./popup/environment-marker.scss')
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

    let options_scss = src('./options/options.scss')
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
        .pipe(dest('./options/'));

    let content_scss = src('./css/content.scss')
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

    return merge(environment_marker_scss, options_scss, content_scss);
}

// Watch files
function watchFiles() {
    watch('./popup/environment-marker.scss', css);
    watch('./popup/environment-marker.js', js);
    watch('./options/options.scss', css);
    watch('./options/options.js', js);
    watch('./css/content.scss', css);
    watch('./js/background.js', js);
    watch('./js/content.js', js);
}

exports.default = series(parallel(js, css), watchFiles);
