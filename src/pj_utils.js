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
  defn += get_param(P, 'R');
  defn += get_param(P, 'R_A');
  defn += get_param(P, 'R_V');
  defn += get_param(P, 'R_a');
  defn += get_param(P, 'R_lat_a');
  defn += get_param(P, 'R_lat_g');
  defn += get_param(P, 'pm');
  return defn;
}


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
