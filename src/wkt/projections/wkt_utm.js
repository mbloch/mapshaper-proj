/* @requires wkt_add */

add_wkt_parser(wkt_is_utm, wkt_to_utm);
add_wkt_parser(wkt_is_ups, wkt_to_ups);

add_wkt_maker(get_simple_maker_test('utm'), wkt_from_utm);
add_wkt_maker(get_simple_maker_test('ups'), wkt_from_ups);

var WKT_UTM = /UTM_zone_([0-9]{1,2})(N|S)/i;
var WKT_UPS = /UPS_(North|South)/i;

function wkt_is_utm(projcs) {
  return WKT_UTM.test(wkt_name_to_slug(projcs.NAME));
}

function wkt_is_ups(projcs) {
  return WKT_UPS.test(wkt_name_to_slug(projcs.NAME));
}

function wkt_to_utm(projcs) {
  return wkt_projcs_converter({
    PROJECTION: wkt_simple_projection_converter('utm'),
    PARAMETER: utm_params
  })(projcs);

  function utm_params(projcs) {
    var match = WKT_UTM.exec(wkt_name_to_slug(projcs.NAME));
    var params = '+zone=' + match[1];
    if (match[2] == 'S') params += ' +south';
    return params;
  }
}

function wkt_to_ups(projcs) {
  return wkt_projcs_converter({
    PROJECTION: wkt_simple_projection_converter('ups'),
    PARAMETER: ups_params
  })(projcs);

  function ups_params(projcs) {
    var match = WKT_UPS.exec(wkt_name_to_slug(projcs.NAME));
    return match[1].toLowerCase() == 'south' ? '+south' : '';
  }
}

function wkt_from_utm(P) {
  return wkt_projcs_maker({
    NAME: wkt_make_utm_name,
    PROJECTION: function () {return 'Transverse_Mercator';},
    PARAMETER: wkt_make_utm_params
  })(P);
}

function wkt_from_ups(P) {
  return wkt_projcs_maker({
    NAME: wkt_make_ups_name,
    PROJECTION: function () {return 'Polar_Stereographic';},
    PARAMETER: wkt_make_ups_params
  })(P);
}

function wkt_make_utm_name(P, projcs) {
  return projcs.GEOGCS.NAME + ' / UTM zone ' + pj_param(P.params, 'szone') + (pj_param(P.params, 'tsouth') ? 'S' : 'N');
}

function wkt_make_ups_name(P, projcs) {
  return projcs.GEOGCS.NAME + ' / UPS ' + (pj_param(P.params, 'tsouth') ? 'South' : 'North');
}

function wkt_make_utm_params(P) {
  var lon0 = P.lam0 * 180 / M_PI;
  return [
    ["latitude_of_origin", 0],
    ["central_meridian", lon0],
    ["scale_factor", P.k0],
    ["false_easting", P.x0],
    ["false_northing", P.y0]
  ];
}

function wkt_make_ups_params(P) {
  return [
    ["latitude_of_origin", -90],
    ["central_meridian", 0],
    ["scale_factor", 0.994],
    ["false_easting", 2000000],
    ["false_northing", 2000000]
  ];
}
