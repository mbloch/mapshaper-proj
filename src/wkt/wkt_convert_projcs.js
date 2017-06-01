/* @requires
wkt_common
wkt_unit
wkt_convert_geogcs
*/

function wkt_convert_projcs(projcs) {
  return find_wkt_parser(projcs)(projcs);
}

function wkt_simple_projcs_converter(projId, paramIds) {
  return wkt_projcs_converter({
    PROJECTION: wkt_simple_projection_converter(projId),
    PARAMETER: wkt_parameter_converter(paramIds)
  });
}

function wkt_simple_projection_converter(id) {
  return function() {return '+proj=' + id;};
}

function wkt_projcs_converter(o) {
  return function(projcs) {
    var projStr = o.PROJECTION(projcs);
    var paramStr = o.PARAMETER(projcs);
    var geogStr = o.GEOGCS ? o.GEOGCS(projcs) : wkt_convert_geogcs(projcs.GEOGCS);
    var unitStr = wkt_convert_unit(projcs);
    return [projStr, paramStr, geogStr, unitStr, '+no_defs'].filter(function(s) {return !!s;}).join(' ');
  };
}
