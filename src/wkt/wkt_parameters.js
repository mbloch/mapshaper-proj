

// Reference:
// http://proj4.org/parameters.html

var wkt_common_params = [
  ['x_0', 'false_easting', 'm'],
  ['y_0', 'false_northing', 'm'],
  ['k_0', 'scale_factor', 'f'],
  ['lat_0', 'latitude_of_center'],
  ['lon_0', 'central_meridian']
];

var wkt_param_table = {
  lat_0b:  ['lat_0', 'latitude_of_origin'],
  lat_0c:  ['lat_0', null], // lcc 1sp, stere
  lat_0d:  ['lat_0', 'standard_parallel_1'],  // stere (esri), merc (esri)
  lat_1:   ['lat_1', 'standard_parallel_1'],
  lat_1b:  ['lat_1', 'latitude_of_point_1'],  // omerc,tpeqd
  lat_1c:  ['lat_1', 'latitude_of_origin'],   // lcc
  lat_2:   ['lat_2', 'standard_parallel_2'],
  lat_2b:  ['lat_2', 'latitude_of_point_2'],  // omerc,tpeqd
  lat_ts:  ['lat_ts', 'standard_parallel_1'], // cea,eqc,merc,stere,wag3,wink1
  lat_tsb: ['lat_ts', 'latitude_of_origin'],  // merc
  lonc:    ['lonc', 'central_meridian'],      // omerc,ocea
  lon_1:   ['lon_1', 'longitude_of_point_1'], // omerc,tpeqd
  lon_2:   ['lon_2', 'longitude_of_point_2'], // omerc,tpeqd
  alpha:   ['alpha', 'azimuth'],              // omerc,ocea
  gamma:   ['gamma', 'rectified_grid_angle'], // omerc
  h:       ['h', 'height', 'f'] // nsper
};

// non-standard name -> standard name
// TODO: consider accepting standard_parallel_1 as (esri) alias for latitude_of_center / latitude_of_origin
var wkt_param_aliases = {
  longitude_of_center: 'central_meridian',
  latitude_of_origin: 'latitude_of_center',
  latitude_of_center: 'latitude_of_origin',
  longitude_of_1st_point: 'longitude_of_point_1',
  longitude_of_2nd_point: 'longitude_of_point_2',
  latitude_of_1st_point: 'latitude_of_point_1',
  latitude_of_2nd_point: 'latitude_of_point_2',
  // proj4
  k: 'k_0'
};

// Convert a wkt PARAMETER name to a proj4 param id
function wkt_convert_param_name_old(wktName, proj) {
  var defn = wkt_find_param_defn_old(proj, function(defn) {
    return defn[1] == wktName;
  });
  return defn ? defn[0] : '';
}

// @proj Proj.4 projection id
function wkt_find_param_defn_old(proj, test) {
  var defn, projs;
  for (var i=0; i<wkt_params.length; i++) {
    defn = wkt_params[i];
    projs = defn[3];
    if (projs && projs.split(',').indexOf(proj) == -1) continue;
    if (test(defn)) return defn;
  }
  return null;
}


function wkt_find_defn(name, idx, arr) {
  for (var i=0; i<arr.length; i++) {
    // returns first match (additional matches -- aliases -- may be present)
    if (arr[i][idx] === name) return arr[i];
  }
  return null;
}

function wkt_find_parameter_defn(name, idx, rules) {
  var defn = null;
  name = name.toLowerCase();
  defn = wkt_find_defn(name, idx, rules);
  if (!defn && (name in wkt_param_aliases)) {
    defn = wkt_find_defn(wkt_param_aliases[name], idx, rules);
  }
  return defn;
}

function wkt_convert_parameter(defn, value, unitDefn) {
  var name = defn[0],
      type = defn[2];
  if (type == 'm') {
    value *= unitDefn.to_meter;
  }
  if (WKT_OMIT_DEFAULTS) {
    if ('x_0,y_0,lat_0,lon_0'.indexOf(name) > -1 && value === 0 ||
      name == 'k_0' && value == 1) {
      return;
    }
  }
  return '+' + name + '=' + value;
}

function wkt_make_parameter(defn, strVal, toMeter) {
  var type = defn[2],
      val;
  if (type == 'm') {
    val = parseFloat(strVal) / toMeter;
  } else if (type == 'f') {
    val = parseFloat(strVal);
  } else {
    val = dmstod(strVal); // default is decimal degrees or DMS
  }
  return [defn[1], val];
}

function wkt_find_parameter_by_name(projcs, name) {
  var params = projcs.PARAMETER || [];
  var paramName;
  for (var i=0; i<params.length; i++) {
    paramName = params[i][0].toLowerCase();
    if (name === paramName || name === wkt_param_aliases[paramName]) {
      return params[i];
    }
  }
  return null;
}

function wkt_get_parameter_value(projcs, name) {
  var param = wkt_find_parameter_by_name(projcs, name);
  return param === null ? null : param[1];
}

function wkt_get_parameter_rules(ids) {
  var rules = null;
  if (ids) {
    rules = wkt_split_names(ids).reduce(function(memo, id) {
      var rule = wkt_param_table[id];
      if (!rule) wkt_error("missing parameter rule: " + id);
      memo.push(rule);
      return memo;
    }, []);
  }
  return (rules || []).concat(wkt_common_params);
}

function wkt_parameter_converter(extraRules) {
  return function(projcs) {
    var parts = [];
    var rules = wkt_get_parameter_rules(extraRules);
    var unitDefn = wkt_get_unit_defn(projcs);
    (projcs.PARAMETER || []).forEach(function(param) { // handle no params
      var defn = wkt_find_parameter_defn(param[0], 1, rules);
      var proj4;
      if (!defn) {
        wkt_warn('unhandled parameter: ' + param[0]);
      } else {
        proj4 = wkt_convert_parameter(defn, param[1], unitDefn);
        if (proj4) parts.push(proj4);
      }
    });
    return parts.join(' ');
  };
}

function wkt_parameter_maker(extraRules) {
  return function(P) {
    var params = [];
    var rules = wkt_get_parameter_rules(extraRules);
    // TODO: think about how to add default params omitted from proj4 defn
    // TODO: think about detecting unused params in proj4 defn
    Object.keys(P.params).forEach(function(key) {
      var defn = wkt_find_parameter_defn(key, 0, rules);
      var sval;
      if (defn && defn[1]) { // handle dummy rules with null wkt param name (see wkt_lcc.js)
        sval = pj_param(P.params, 's' + key);
        params.push(wkt_make_parameter(defn, sval, P.to_meter));
      }
    });
    return params;
  };
}
