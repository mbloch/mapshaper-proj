/* @pj_param */

function pj_is_latlong(P) {
  return !P || P.is_latlong;
}

function pj_is_geocent(P) {
  return !P || P.is_geocent;
}

function get_geod_defn(P) {
  var got_datum = false,
      defn = '';
  if ('datum' in P.params) {
    got_datum = true;
    defn += get_param(P, 'datum');
  } else if ('R' in P.params) {
    // moving R above other params, to match sequence in pj_ell_set.js
    defn += get_param(P, 'R');
  } else if ('ellps' in P.params) {
    defn += get_param(P, 'ellps');
  } else if ('a' in P.params) {
    defn += get_param(P, 'a');
    if ('b' in P.params) {
      defn += get_param(P, 'b');
    } else if ('es' in P.params) {
      defn += get_param(P, 'es');
    } else if ('f' in P.params) {
      defn += get_param(P, 'f');
    } else {
      defn += ' +es=' + P.es;
    }
  } else {
    error(-13);
  }
  if (!got_datum) {
    defn += get_param(P, 'towgs84');
    defn += get_param(P, 'nadgrids');
  }
  // defn += get_param(P, 'R'); // moved to above ellps
  defn += get_param(P, 'R_A');
  defn += get_param(P, 'R_V');
  defn += get_param(P, 'R_a');
  defn += get_param(P, 'R_lat_a');
  defn += get_param(P, 'R_lat_g');
  defn += get_param(P, 'pm');
  return defn;
}

// Convert an initialized proj object back to a Proj.4 string
function get_proj_defn(P) {
  // skip geodetic params and some initialization-related params
  var skip = 'datum,ellps,a,b,es,rf,f,towgs84,nadgrids,R,R_A,R_V,R_a,R_lat_a,R_lat_g,pm,init,no_defs'.split(',');
  var defn = '';
  Object.keys(P.params).forEach(function(name) {
    if (skip.indexOf(name) == -1) {
      defn += get_param(P, name);
    }
  });
  // add geodetic params
  defn += get_geod_defn(P);
  return defn.trim();
}

// Convert an initialized proj object to a stable Proj.4 string for comparing
// coordinate transforms. This omits no-op/default params and canonicalizes
// equivalent WGS84 ellipsoid definitions to +datum=WGS84.
function get_normalized_proj_defn(P) {
  var parts = get_normalized_param_names(P).map(function(name) {
    return {name: name, param: get_param(P, name).trim()};
  });
  var geodParts = get_normalized_geod_params(P);
  var defn = '';
  var names;
  parts = parts.filter(function(part) { return part.param; });
  names = parts.map(function(part) { return part.name; });
  if (names.indexOf('proj') > -1) {
    defn += ' ' + parts.filter(function(part) { return part.name == 'proj'; })[0].param;
    parts = parts.filter(function(part) { return part.name != 'proj'; });
  }
  parts.sort(function(a, b) {
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  }).forEach(function(part) {
    defn += ' ' + part.param;
  });
  geodParts.sort(function(a, b) {
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  }).forEach(function(part) {
    defn += ' ' + part.param;
  });
  return defn.trim();
}

function get_normalized_param_names(P) {
  var skip = 'datum,ellps,a,b,es,rf,f,towgs84,nadgrids,R,R_A,R_V,R_a,R_lat_a,R_lat_g,pm,init,no_defs'.split(',');
  return Object.keys(P.params).filter(function(name) {
    if (skip.indexOf(name) > -1) return false;
    if (P.params[name].used === false) return false;
    if (name == 'axis' && pj_param(P.params, 'saxis') == 'enu') return false;
    return true;
  });
}

function get_normalized_geod_params(P) {
  if (uses_wgs84_datum(P)) {
    return [{name: 'datum', param: '+datum=WGS84'}];
  }
  return get_geod_defn(P).split(' ').filter(function(part) {
    return part && part != '+pm=0' && part != '+no_defs';
  }).map(function(part) {
    return {
      name: part.replace(/^\+([^=]+).*/, '$1'),
      param: part
    };
  });
}

function uses_wgs84_datum(P) {
  if (pj_param(P.params, 'sdatum') == 'WGS84') return true;
  return has_no_datum_shift(P) && is_wgs84_ellipsoid(P);
}

function has_no_datum_shift(P) {
  return (P.datum_params || []).every(function(val) { return val === 0; }) &&
    (P.gridlist_count || 0) === 0 &&
    (P.vgridlist_geoid_count || 0) === 0 &&
    !pj_param(P.params, 'snadgrids');
}

function is_wgs84_ellipsoid(P) {
  return P.a_orig == 6378137 &&
    Math.abs(P.es_orig - 0.0066943799901413165) < 0.000000000050;
}

function get_param(P, name) {
  var param = '';
  if (name in P.params) {
    param = ' +' + name;
    if (P.params[name].param !== true) {
      param += '=' + pj_param(P.params, 's' + name);
    }
  }
  return param;
}
