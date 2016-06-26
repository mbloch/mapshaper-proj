
function pj_is_latlong(P) {
  return !P || P.is_latlong;
}

function pj_is_geocent(P) {
  return !P || P.is_geocent;
}

function pj_latlong_from_proj(P) {
  var defn = '+proj=latlong';
  var got_datum = false;

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
  return pj_init(defn);
}

function get_param(P, name) {
  if (name in P.params) {
    return ' +' + name + '=' + pj_param(P.params, 's' + name);
  }
  return '';
}
