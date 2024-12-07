// =====================================================================================================================
// ======== Config =====================================================================================================
// =====================================================================================================================

const breakpoints = [{
    "name": "mobile",
    "min": "none",
    "max": "600px"
  },
  {
    "name": "tablet",
    "min": "600px",
    "max": "1200px"
  },
  {
    "name": "desktop",
    "min": "1200px",
    "max": "1600px"
  },
  {
    "name": "desktop-wide",
    "min": "1600px",
    "max": "none"
  }
];

const base = {
  source: 'src/',
  build: 'build/', // Deprecated, use dev_build
  dev_build: 'build/',
  release_build: 'release/',
  templates: 'templates/'
};

const breakpointTemplates = {
  html: {
    src: 'utils/',
    dest: 'utils/',
    ext: ['.html'],
  },

  sass: {
    src: 'sass/utils/',
    dest: 'sass/utils/',
    ext: ['.scss'],
  },
}

/*
  Full list of everything we need to process:
   - Fonts - Done
   - Images - Done
   - Icons - Done
   - Sample data - Done
   - JavaScript - Done
   - TypeScript - Done
   - SASS - Done
   - CSS - Done
   - HTML - Done
*/

const files = {
  fonts: {
    src: 'assets/fonts/',
    dest: 'assets/fonts/',
    ext: ['.woff', '.woff2'],
  },

  img: {
    src: 'assets/img/',
    dest: 'assets/img/',
    ext: ['.png', '.jpg', '.jpeg', '.webp'],
  },

  icons: {
    src: 'assets/icons/',
    dest: 'assets/icons/',
    ext: ['.svg'],
  },

  samples: {
    src: 'assets/samples/',
    dest: 'assets/samples/',
    ext: [''],
  },

  js: {
    src: 'assets/js/',
    dest: 'assets/js/',
    ext: ['.js'],
  },

  ts: {
    src: 'assets/ts/',
    dest: 'assets/js/',
    ext: ['.ts'],
  },

  sass: {
    src: 'sass/',
    dest: 'assets/css/',
    ext: ['.scss'],
  },

  css: {
    src: 'assets/css/',
    dest: 'assets/css/',
    ext: ['.css'],
  },

  html: {
    src: '',
    dest: '',
    ext: ['.html'],
  }
};

const prettier = {
  arrowParens: "always",
  bracketSpacing: true,
  endOfLine: "lf",
  htmlWhitespaceSensitivity: "css",
  insertPragma: false,
  singleAttributePerLine: false,
  bracketSameLine: true,
  jsxBracketSameLine: false,
  jsxSingleQuote: false,
  printWidth: 120,
  proseWrap: "preserve",
  quoteProps: "as-needed",
  requirePragma: false,
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  useTabs: false,
  embeddedLanguageFormatting: "auto",
  vueIndentScriptAndStyle: false,
};

const autoprefixer = {
  cascade: false,
  flexbox: "no-2009",
};

const fileinclude = {
  prefix: '@@',
  suffix: '@@',
  basepath: 'src/',
  context: {
    breakpoints: breakpoints,
  }
};

const typescript = {

};

const no_encoding = {
  encoding: false,
  // buffer: false,
};

const with_sourcemaps = {
  sourcemaps: true
};

// =====================================================================================================================
// ======== Utility ====================================================================================================
// =====================================================================================================================

function buildBreakpoints() {
  let bps = breakpoints.map((b) => {
    let mediaUp = '';
    let mediaDown = '';
    let mediaExact = '';
    if (b.min !== 'none') {
      mediaUp = mediaExact = `(min-width: ${b.min})`;
    }

    if (b.max !== 'none') {
      let max = parseInt(b.max, 10) - 0.02;
      mediaDown = mediaExact = `(max-width: ${max}px)`;
    }

    if (b.min !== 'none' && b.max !== 'none') {
      mediaExact = `${mediaUp} and ${mediaDown}`;
    }

    return Object.assign(b, {
      media: {
        up: mediaUp,
        down: mediaDown,
        exact: mediaExact
      }
    });
  });

  return bps;
}

function buildTemplates() {
  let res = {};

  for (const name in breakpointTemplates) {
    const t = breakpointTemplates[name];

    res[name] = {
      src: t.ext.flatMap((e) => [base.templates + t.src + '**/*' + e]),
      dest: base.source + t.dest,
    };
  }

  return res;
}

function buildPaths() {
  let res = base;

  for (const name in files) {
    const file = files[name];

    res[name] = {
      src: file.ext.flatMap((e) => [base.source + file.src + '**/*' + e]),
      filter: file.ext.flatMap((e) => [base.source + file.src + '**/*' + e, '!' + base.source + file.src + '**/_*' + e]),
      dest: base.build + file.dest,
    };
  }

  const warnOnAccess = {
    get(target, prop, receiver) {
      console.warn(
        '\n\x1b[33m\x1b[1mWarning:\x1b[0m',
        'config.paths is deprecated, please use config.root to access `config.paths.' + prop + '`\n'
      );
      return Reflect.get(...arguments);
    },
  }

  return new Proxy(res, warnOnAccess);
};

function buildRoot() {
  let root = {
    source: {},
    dev_build: {},
    release_build: {},
  };

  root.source.path = base.source;
  root.dev_build.path = base.dev_build;
  root.release_build.path = base.release_build;

  function fileList(file, path) {
    return file.ext.flatMap((e) => [path + '**/*' + e]);
  }

  function fileFilter(file, path) {
    return file.ext.flatMap((e) => [path + '**/*' + e, '!' + path + '**/_*' + e]);
  }

  for (const name in files) {
    const file = files[name];

    root.source[name] = {
      path: base.source + file.src,
      files: fileList(file, base.source + file.src),
      filter: fileFilter(file, base.source + file.src),
    };

    root.dev_build[name] = {
      path: base.dev_build + file.dest,
      files: fileList(file, base.dev_build + file.dest),
      filter: fileFilter(file, base.dev_build + file.dest),
    };

    root.release_build[name] = {
      path: base.release_build + file.dest,
      files: fileList(file, base.release_build + file.dest),
      filter: fileFilter(file, base.release_build + file.dest),
    };
  }

  return root;
}

export default {
  breakpoints: Object.freeze(buildBreakpoints()),
  templates: Object.freeze(buildTemplates()),
  paths: Object.freeze(buildPaths()), // Deprecated, use config.root
  root: Object.freeze(buildRoot()),
  prettier: Object.freeze(prettier),
  autoprefixer: Object.freeze(autoprefixer),
  fileinclude: Object.freeze(fileinclude),
  typescript: Object.freeze(typescript),
  no_encoding: Object.freeze(no_encoding),
  with_sourcemaps: Object.freeze(with_sourcemaps),
};
