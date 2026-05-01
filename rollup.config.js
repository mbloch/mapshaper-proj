var path = require('path');
var legacy = require('./scripts/legacy_bundle.js');

function buildConfig(opts) {
  var deps = opts.deps || [];
  var entryFile = opts.minimal ? 'src/proj-minimal.js' : 'src/proj.js';
  var outBase = opts.outBase;
  var libraryDirs = [
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'node_modules/geographiclib/src')
  ];

  return [
    {
      input: '\0mproj-entry-cjs',
      plugins: [legacyPlugin(entryFile, deps, libraryDirs, 'cjs')],
      output: {
        file: path.resolve(__dirname, 'dist/' + outBase + '.js'),
        format: 'cjs'
      }
    },
    {
      input: '\0mproj-entry-esm',
      plugins: [legacyPlugin(entryFile, deps, libraryDirs, 'esm')],
      output: {
        file: path.resolve(__dirname, 'dist/' + outBase + '.mjs'),
        format: 'esm'
      }
    }
  ];
}

function legacyPlugin(entryFile, deps, libraryDirs, format) {
  var id = format === 'esm' ? '\0mproj-entry-esm' : '\0mproj-entry-cjs';
  return {
    name: 'legacy-proj-bundle-' + format,
    resolveId: function(source) {
      if (source === id) {
        return id;
      }
      return null;
    },
    load: function(source) {
      if (source !== id) {
        return null;
      }
      var output = legacy.createBundleWithMeta({
        entryFile: entryFile,
        projectionDeps: deps,
        libraryDirs: libraryDirs,
        format: format
      });
      output.files.forEach(function(filePath) {
        this.addWatchFile(filePath);
      }, this);
      return output.code;
    }
  };
}

module.exports = buildConfig;
