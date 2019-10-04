/* @require pj_utils wkt_fallback */

// Global collections of WKT parsers and makers
// arr[0] is test function; arr[1] is conversion function
var wkt_makers = [];
var wkt_parsers = [];

// TODO: use utility library
function wkt_is_object(val) {
  return !!val && typeof val == 'object' && !Array.isArray(val);
}

function wkt_is_string(val) {
  return typeof val == 'string';
}

function find_wkt_parser(projcs) {
  var parser = find_wkt_conversion_function(projcs, wkt_parsers);
  if (!parser) {
    parser = get_fallback_wkt_parser(projcs);
  }
  if (!parser) {
    wkt_error('unsupported WKT definition: ' + get_wkt_label(projcs));
  }
  return parser;
}

function find_wkt_maker(P) {
  var maker = find_wkt_conversion_function(P, wkt_makers);
  if (!maker) {
    maker = get_fallback_wkt_maker(P);
  }
  if (!maker) {
    wkt_error('unsupported projection: ' + get_proj_label(P));
  }
  return maker;
}

function find_wkt_conversion_function(o, arr) {
  var is_match;
  for (var i=0; i<arr.length; i++) {
    is_match = arr[i][0];
    if (is_match(o)) return arr[i][1];
  }
  return null;
}

function get_proj_label(P) {
  return get_proj_id(P) || '[unknown]';
}

function get_wkt_label(o) {
  return o.NAME || '[unknown]';
}

function get_proj_id(P) {
  return  pj_param(P.params, 'sproj');
}

function wkt_name_to_slug(name) {
  return name.replace(/[-_ \/]+/g, '_').toLowerCase();
}

function wkt_split_names(names) {
  var arr;
  if (Array.isArray(names)) {
    arr = names;
  } else if (names && names.length > 0) {
    arr = names.split(',');
  }
  return arr;
}

function wkt_error(msg) {
  throw new Error(msg);
}

function wkt_warn(msg) {
  // TODO: consider option to inhibit logging
  //       consider strict mode to throw error
  console.error('[wkt] ' + msg);
}
