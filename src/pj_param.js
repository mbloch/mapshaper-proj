/* @requires dmstor, pj_strtod */

/* types
  t  test for presence
  i  integer
  d  simple real
  r  dms or decimal degrees
  s  string
  b  boolean
*/


// see pj_param.c
// this implementation is slightly different
function pj_param(params, code) {
  var type = code[0],
      name = code.substr(1),
      obj = params[name],
      isset = obj !== void 0,
      val, param;
  if (type == 't') {
    val = isset;
  } else if (isset) {
    param = obj.param;
    obj.used = true;
    if (type == 'i') {
      val = parseInt(param);
    } else if (type == 'd') {
      // Proj.4 handles locale-specific decimal mark
      // TODO: what to do about NaNs
      val = pj_atof(param);
    } else if (type == 'r') {
      val = dmstor(param);
    } else if (type == 's') {
      val = String(param);
    } else if (type == 'b') {
      if (param == 'T' || param == 't' || param === true) {
        val = true;
      } else if (param == 'F' || param == 'f') {
        val = false;
      } else {
        pj_ctx_set_errno(-8);
        val = false;
      }
    }
  } else {
    // value is not set; use default
    val = {
      i: 0,
      b: false,
      d: 0,
      r: 0,
      s: ''
    }[type];
  }
  if (val === void 0) {
    fatal("invalid request to pj_param, fatal");
  }
  return val;
}

// convert arguments in a proj4 definition string into object properties
// (not in Proj.4)
function pj_get_params(args) {
  var rxp = /\+([a-z][a-z0-9_]*(?:=[^\s]*)?)/gi;
  var params = {};
  var match;
  while (match = rxp.exec(args)) {
    pj_mkparam(params, match[1]);
  }
  return params;
}

// different from Proj.4
function pj_mkparam(params, token) {
  var parts = token.split('=');
  var name, val;
  if (parts.length == 1) {
    name = token;
    val = true;
  } else {
    name = parts[0];
    val = token.substr(parts[0].length + 1);
  }
  params[name] = {used: false, param: val};
}
