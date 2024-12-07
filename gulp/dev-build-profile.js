export default function(config, {
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
}) {
  const src = config.root.source;
  const dest = config.root.dev_build;

  return {
    build_fonts: function() {
      return gulp.src(src.fonts.files, config.no_encoding)
        .pipe(gulp.dest(dest.fonts.path));
    },

    build_images: function() {
      const resize = config.breakpoints.map((bp) => {
        if (bp.max === 'none') return {
          suffix: '.' + bp.name,
        };
        else return {
          width: parseInt(bp.max, 10),
          withoutEnlargement: true,
          suffix: '.' + bp.name,
        };
      });

      const nameImage = (path) => {
        const dot = path.basename.lastIndexOf('.');
        const name = path.basename.slice(0, dot);
        const bp = path.basename.slice(dot + 1);
        path.dirname = name;
        path.basename = bp;
        path.extname = '.webp';
      };

      return gulp.src(src.img.files, config.no_encoding)
        .pipe(rezzy(resize))
        .pipe(imagemin([
          imageminWebp({
            // For dev-builds, prioritize speed over quality
            quality: 25,
            method: 1,
            autoFilter: false,
            lossless: false,
          })
        ]))
        .pipe(rename(nameImage))
        .pipe(gulp.dest(dest.img.path));
    },

    build_icons: function() {
      return gulp.src(src.icons.files, config.no_encoding)
        .pipe(gulp.dest(dest.icons.path));
    },

    build_samples: function() {
      return gulp.src(src.samples.files, config.no_encoding)
        .pipe(gulp.dest(dest.samples.path));
    },

    build_js: function() {
      return gulp.src(src.js.files)
        .pipe(prettier(config.prettier))
        .pipe(gulp.dest(dest.js.path));
    },

    build_ts: function() {
      return gulp.src(src.ts.files, config.with_sourcemaps)
        .pipe(tsProject())
        .pipe(gulp.dest(dest.ts.path, config.with_sourcemaps));
    },

    build_sass: function() {
      return gulp.src(src.sass.files, config.with_sourcemaps)
        .pipe(fileinclude(config.fileinclude))
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(autoprefixer(config.autoprefixer))
        .pipe(prettier(config.prettier))
        .pipe(gulp.dest(dest.sass.path, config.with_sourcemaps));
    },

    build_css: function() {
      return gulp.src(src.css.files)
        .pipe(prettier(config.prettier))
        .pipe(gulp.dest(dest.css.path))
    },

    build_html: function() {
      return gulp.src(src.html.files)
        .pipe(fileinclude(config.fileinclude))
        .pipe(filter(src.html.filter))
        .pipe(prettier(config.prettier))
        .pipe(gulp.dest(dest.html.path));
    }
  };
}
