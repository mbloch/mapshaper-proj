

function wkt_get_unit_defn(projcs) {
  // TODO: consider using unit names
  return {
    to_meter: projcs.UNIT[1]
  };
}

function wkt_convert_unit(PROJCS) {
  var defn = wkt_get_unit_defn(PROJCS);
  var proj4 = "";
  if (defn.to_meter != 1) {
    proj4 = '+to_meter=' + defn.to_meter;
  } else if (!WKT_OMIT_DEFAULTS) {
    proj4 = '+units=m';
  }
  return proj4;
}

function wkt_make_unit(P) {
  return ['Meter', P.to_meter || 1];
}

/*
// OLD -- merge into wkt_make_unit()
function wkt_get_unit(P) {
  var defn = pj_find_units_by_value(P.to_meter);
  var name = defn ? defn.name : 'Unknown';
  return ['UNIT', name, P.to_meter];
}
*/
