// Replacement functions for Proj.4 pj_open_lib() (see pj_open_lib.c)
// and get_opt() (see pj_init.c)

// Return opts from a section of a config file,
//   or null if not found or unable to read file
function pj_read_lib_opts(file, id) {
  var path, str;
  try {
    path = require('path').join(__dirname, '../nad', file);
    str = pj_read_opts(path, id);
  } catch(e) {}
  return str || null;
}

// Read projections params from a file and return in a standard format
function pj_read_opts(path, id) {
  var contents = require('fs').readFileSync(path, 'utf8'),
      str = '',
      idx;
  // get requested parameters
  idx = contents.indexOf('<' + id + '>');
  if (idx > -1) {
    str = contents.substr(idx + id.length + 2);
    str = str.substr(0, str.indexOf('<'));
  }
  // remove comments
  str = str.replace(/#.*/g, '');
  // convert all whitespace to single <sp>
  str = str.replace(/[\s]+/g, ' ');

  // if '+' is missing from args, add it
  // kludge: protect spaces in +title= opts
  str = str.replace(/\+title=[^+]*[^ +]/g, function(match) {
    return match.replace(/ /g, '\t');
  });
  str = ' ' + str;
  str = str.replace(/ (?=[a-z])/ig, ' +');
  str = str.replace(/\t/g, ' ');
  return str.trim() || null;
}
