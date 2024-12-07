import config from './gulp/config.js';

import gulp from 'gulp';
import clean from 'gulp-clean';
import newer from 'gulp-newer';
import rename from 'gulp-rename';
import filter from 'gulp-filter';
import prettier from 'gulp-prettier';
import autoprefixer from 'gulp-autoprefixer';
import fileinclude from 'gulp-file-include';
import imagemin from 'gulp-imagemin';
import imageminWebp from 'imagemin-webp';
import rezzy from 'gulp-rezzy';

import ts from 'gulp-typescript';
var tsProject = ts.createProject(config.typescript);

import browserSync from 'browser-sync';
const browser = browserSync.create();

import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);

// =====================================================================================================================
// ======== Profile making utils =======================================================================================
// =====================================================================================================================

const profile_deps = {
  gulp,
  rename,
  filter,
  prettier,
  autoprefixer,
  fileinclude,
  imagemin,
  imageminWebp,
  rezzy,
  tsProject,
  sass
};

function createTaskFromProfile(profile) {
  const tasks = profile(config, profile_deps);
  return gulp.series(
    clear_build,
    gulp.parallel(
      tasks.build_fonts,
      tasks.build_images,
      tasks.build_icons,
      tasks.build_samples,
      tasks.build_js,
      tasks.build_ts,
      tasks.build_sass,
      tasks.build_css,
      tasks.build_html
    ),
    reload
  );
}

import dev_build_profile from './gulp/dev-build-profile.js'
export let build_dev = createTaskFromProfile(dev_build_profile);

// =====================================================================================================================
// ======== Global utils ===============================================================================================
// =====================================================================================================================

function clear_build() {
  return gulp.src(config.root.dev_build.path, {
    read: false,
    allowEmpty: true
  }).pipe(clean());
}
export {
  clear_build
};

function build_html_breakpoints() {
  return gulp.src(config.templates.html.src)
    .pipe(fileinclude(config.fileinclude))
    .pipe(prettier(config.prettier))
    .pipe(gulp.dest(config.templates.html.dest));
}

function build_sass_breakpoints() {
  return gulp.src(config.templates.sass.src)
    .pipe(fileinclude(config.fileinclude))
    // .pipe(prettier(config.prettier))
    .pipe(gulp.dest(config.templates.sass.dest));
}

export let build_breakpoints = gulp.parallel(build_html_breakpoints, build_sass_breakpoints);

// =====================================================================================================================
// ======== Browser sync ===============================================================================================
// =====================================================================================================================

export function watch() {
  gulp.watch(config.root.source.path, build_dev);
  gulp.watch(config.paths.templates, gulp.series(build_breakpoints, build_dev));
  gulp.watch('./gulp/config.js', (cb) => cb("Can't hotswap the config file. Please restart the 'watch' task!"));
  // gulp.series(build_breakpoints, build_dev)();
}

export function sync() {
  browser.init({
    server: {
      baseDir: config.root.dev_build.path
    },
    port: 3000,
    startPath: 'index.html',
  }, (_) => {
    watch();
  });
}

export function reload(cb) {
  if (browser.active) browser.reload();
  cb()
}

export let serve =
  gulp.series(
    build_breakpoints,
    build_dev,
    sync
  );

export function check_config(cb) {
  console.log(JSON.stringify(config, null, 2));
  cb();
}
