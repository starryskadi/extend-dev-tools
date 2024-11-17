const gulp = require("gulp");
const { series, parallel, src, dest, watch } = gulp

const map = require('map-stream');
const buffer = require('gulp-buffer');
const rename = require('gulp-rename');

const browserify = require('browserify');
const tsify = require("tsify");

const DIST_FOLDER = "./dist"
const fs = require('fs').promises;

async function cleanUp() {
    try {
        return await fs.rmdir(DIST_FOLDER, { force: true, recursive: true });   
    } catch (e) {
        if (e.code === "ENOENT") {
            // If the file not exist, return true
            return true
        } 
        throw e
    }   
}

function compileHTML() {
    return src('src/*.html').pipe(dest(`${DIST_FOLDER}`))
}

function compileCSS() {
    return src('src/styles/*.css').pipe(dest(`${DIST_FOLDER}/styles`))
}

function compileFiles() {
    return src("src/public/*").pipe(dest(`${DIST_FOLDER}`))
}

function compileManifest() {
    return src("src/manifest.json").pipe(dest(`${DIST_FOLDER}`))
}

function compileTypeScript() {
    return src("src/scripts/*.ts")
    .pipe(map(
        function(file, done) {
            const newContent = browserify(file.path, { debug: true }).plugin(tsify).bundle()
            file.contents = newContent
            done(false, file)
        }
    ))
    .pipe(buffer())
    .pipe(rename(function(path) {
        path.extname = ".js"
    }))
    .pipe(dest(`${DIST_FOLDER}/scripts`))
}

gulp.task('default', 
    series(
        cleanUp,
        compileHTML, 
        compileCSS,
        compileTypeScript,
        compileFiles,
        compileManifest
    )
)