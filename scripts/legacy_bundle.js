var fs = require('fs');
var path = require('path');

var REQUIRES_RXP = /\/\*+\s*@requires?\b([\s,;_0-9A-Za-z.-]+)\s*\*+\/\s*\n?/g;
var REQUIRES_NAME_RXP = /\*?[_0-9a-z](?:[.-]?[_0-9a-z])*/ig;

function createBundle(opts) {
  return createBundleWithMeta(opts).code;
}

function createBundleWithMeta(opts) {
  var entryFile = opts.entryFile;
  var projectionDeps = opts.projectionDeps || [];
  var format = opts.format || 'cjs';
  var libraryDirs = opts.libraryDirs || [];
  var knownFileIndex = indexLibraries(libraryDirs);
  var visited = {};
  var sorting = {};
  var orderedFiles = [];

  visit(entryFile, projectionDeps);

  var js = orderedFiles.map(function(filePath) {
    return fs.readFileSync(filePath, 'utf8');
  }).join('\n\n');

  js = stripRequiresComments(js);
  js = rewriteModuleFooter(js, format);
  if (format === 'esm') {
    return {
      code: js + '\n',
      files: orderedFiles.slice()
    };
  }
  return {
    code: '(function(){\n' + js + '\n}());\n',
    files: orderedFiles.slice()
  };

  function visit(filePath, injectedDeps) {
    var normalized = normalizePath(filePath);
    if (visited[normalized]) {
      return;
    }
    if (sorting[normalized]) {
      throw new Error('Circular dependency while bundling: ' + normalized);
    }
    sorting[normalized] = true;
    var src = fs.readFileSync(normalized, 'utf8');
    var deps = parseDeps(src).concat(injectedDeps || []);
    deps.forEach(function(dep) {
      var depPath = knownFileIndex[dep];
      if (!depPath) {
        throw new Error('Unknown dependency in ' + normalized + ' -- ' + dep);
      }
      visit(depPath, null);
    });
    sorting[normalized] = false;
    visited[normalized] = true;
    orderedFiles.push(normalized);
  }
}

function parseDeps(js) {
  var deps = [];
  var match, depMatch;
  REQUIRES_RXP.lastIndex = 0;
  while ((match = REQUIRES_RXP.exec(js))) {
    REQUIRES_NAME_RXP.lastIndex = 0;
    while ((depMatch = REQUIRES_NAME_RXP.exec(match[1]))) {
      deps.push(depMatch[0]);
    }
  }
  return deps;
}

function stripRequiresComments(js) {
  REQUIRES_RXP.lastIndex = 0;
  return js.replace(REQUIRES_RXP, '');
}

function rewriteModuleFooter(js, format) {
  var footerRx =
    /if \(typeof define == 'function' && define\.amd\) \{[\s\S]*?else \{\s*this\.mproj = api;\s*\}/m;
  if (!footerRx.test(js)) {
    throw new Error('Could not find module export footer in bundle entry');
  }
  var replacement;
  if (format === 'esm') {
    replacement = 'export default api;';
  } else {
    replacement = 'module.exports = api;';
  }
  return js.replace(footerRx, replacement);
}

function indexLibraries(dirs) {
  var index = {};
  dirs.forEach(function(dirPath) {
    walkJsFiles(dirPath).forEach(function(filePath) {
      var basename = path.basename(filePath, '.js');
      if (!(basename in index)) {
        index[basename] = normalizePath(filePath);
      }
    });
  });
  return index;
}

function walkJsFiles(dirPath, memo) {
  memo = memo || [];
  fs.readdirSync(dirPath).forEach(function(name) {
    var filePath = path.join(dirPath, name);
    var stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkJsFiles(filePath, memo);
    } else if (/\.js$/.test(filePath)) {
      memo.push(filePath);
    }
  });
  return memo;
}

function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

module.exports = {
  createBundle: createBundle,
  createBundleWithMeta: createBundleWithMeta
};
