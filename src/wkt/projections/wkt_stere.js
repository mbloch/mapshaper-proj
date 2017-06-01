/* @requires wkt_add */

// add_simple_wkt_parser('stere', ['Stereographic', 'Polar_Stereographic', 'Stereographic_North_Pole', 'Stereographic_South_Pole']);

/*
  Stereographic vs. Polar Stereographic from geotiff
  http://geotiff.maptools.org/proj_list/polar_stereographic.html
  http://geotiff.maptools.org/proj_list/stereographic.html
  http://geotiff.maptools.org/proj_list/random_issues.html#stereographic

*/

add_wkt_parser(get_simple_parser_test('Stereographic,Polar_Stereographic,Stereographic_North_Pole,Stereographic_South_Pole'),
  wkt_projcs_converter({
    PROJECTION: wkt_simple_projection_converter('stere'),
    PARAMETER: wkt_convert_stere_params
  }));

add_wkt_maker(get_simple_maker_test('stere'),
  wkt_projcs_maker({
    PROJECTION: wkt_make_stere_projection,
    PARAMETER: wkt_make_stere_params
  }));

function wkt_convert_stere_params(projcs) {
  // assuming not oblique; TOOD: verify not oblique
  var params = wkt_parameter_converter('lat_ts,lat_tsb')(projcs);
  var match = /lat_ts=([^ ]+)/.exec(params);
  if (match && params.indexOf('lat_0=') == -1) {
    // Add +lat_0=90 or +lat_0=-90
    params = '+lat_0=' + (parseFloat(match[1]) < 0 ? -90 : 90) + ' ' + params;
  }
  return params;
}

function wkt_make_stere_projection(P) {
  return wkt_proj4_is_stere_polar(P) ? 'Polar_Stereographic' : 'Oblique_Stereographic';
}

function wkt_make_stere_params(P) {
  return wkt_proj4_is_stere_polar(P) ?
    wkt_parameter_maker('lat_tsb,lat_0c')(P) : // lat_ts -> latitude_of_origin, lat_0 -> null
    wkt_parameter_maker('lat_0b');      // lat_0 -> latitude_of_origin
}

function wkt_proj4_is_stere_polar(P) {
  return pj_param(P.params, 'tlat_ts');
}
