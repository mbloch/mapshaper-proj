// Replacement functions for Proj.4 pj_open_lib() (see pj_open_lib.c)
// and get_opt() (see pj_init.c)

// Return opts from a section of a config file,
//   or null if not found or unable to read file
function pj_read_init_opts(initStr) {
  var parts = initStr.split(':'),
      file = parts[0],
      id = parts[1],
      path, o;
  if (!id) {
    error(-3);
  }
  try {
    path = require('path');
    // assumes compiled library is in the dist/ directory
    o = pj_read_opts(path.join(path.dirname(__filename), '../nad', file), id);
  } catch(e) {}
  return o || null;
}

// Read projections params from a file and return in a standard format
function pj_read_opts(path, id) {
  var contents = require('fs').readFileSync(path, 'utf8'),
      opts = '', comment = '',
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
