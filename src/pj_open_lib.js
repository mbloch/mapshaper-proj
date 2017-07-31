// Replacement functions for Proj.4 pj_open_lib() (see pj_open_lib.c)
// and get_opt() (see pj_init.c)

var libcache = {};

// add a definition library without reading from a file (for use by web app)
function mproj_insert_libcache(libId, contents) {
  libcache[libId] = contents;
}

function mproj_search_libcache(libId) {
  return libcache[libId] || null;
}

// Return opts from a section of a config file,
//   or null if not found or unable to read file
function pj_read_init_opts(initStr) {
  var parts = initStr.split(':'),
      libId = parts[0],
      crsId = parts[1],
      libStr, libPath, path, o;
  if (!crsId || !libId) {
    error(-3);
  }
  libStr = mproj_search_libcache(libId);
  if (!libStr) {
    try {
      // path to library assumes mproj script is in the dist/ directory
      // read error is handled elsewhere
      path = require('path');
      libPath = path.join(path.dirname(__filename), '../nad', libId);
      libStr = require('fs').readFileSync(libPath, 'utf8');
      libcache[libId] = libStr;
    } catch(e) {
      fatal('unable to read from \'init\' file named ' + libId); // not in Proj.4
    }
  }
  return libStr ? pj_find_opts(libStr, crsId) : null;
}

// Find params in contents of an init file
function pj_find_opts(contents, id) {
  var opts = '', comment = '',
      idx, idx2;
  // get requested parameters
  idx = contents.indexOf('<' + id + '>');
  if (idx > -1) {
    // get comment text
    idx2 = contents.lastIndexOf('#', idx);
    if (idx2 > -1) {
      comment = contents.substring(idx2 + 1, idx).trim();
      if (/\n/.test(comment)) {
        comment = '';
      }
    }
    // get projection params
    opts = contents.substr(idx + id.length + 2);
    opts = opts.substr(0, opts.indexOf('<'));
    // remove comments
    opts = opts.replace(/#.*/g, '');
    // convert all whitespace to single <sp>
    opts = opts.replace(/[\s]+/g, ' ');

    // if '+' is missing from args, add it
    // kludge: protect spaces in +title= opts
    opts = opts.replace(/\+title=[^+]*[^ +]/g, function(match) {
      return match.replace(/ /g, '\t');
    });
    opts = ' ' + opts;
    opts = opts.replace(/ (?=[a-z])/ig, ' +');
    opts = opts.replace(/\t/g, ' ').trim();
  }
  return opts ? {opts: opts, comment: comment} : null;
}
