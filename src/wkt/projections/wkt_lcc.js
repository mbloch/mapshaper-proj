/* @requires wkt_add, wkt_parameters */

add_wkt_parser(get_simple_parser_test(
  'Lambert_Conformal_Conic,Lambert_Conformal_Conic_1SP,Lambert_Conformal_Conic_2SP'),
  wkt_projcs_converter({
    PROJECTION: wkt_simple_projection_converter('lcc'),
    PARAMETER: wkt_convert_lcc_params
  }));

add_wkt_maker(get_simple_maker_test('lcc'),
  wkt_projcs_maker({
    PROJECTION: wkt_make_lcc_projection,
    PARAMETER: wkt_make_lcc_params
  }));

function wkt_make_lcc_params(P) {
  var params = wkt_proj4_is_lcc_1sp(P) ? 'lat_1c,lat_0c' : 'lat_0b,lat_1,lat_2';
  return wkt_parameter_maker(params)(P);
}

function wkt_convert_lcc_params(projcs) {
  var params = wkt_projcs_is_lcc_1sp(projcs) ? 'lat_1c' : 'lat_0b,lat_1,lat_2';
  return wkt_parameter_converter(params)(projcs);
}

function wkt_make_lcc_projection(P) {
  return wkt_proj4_is_lcc_1sp(P) ? 'Lambert_Conformal_Conic_1SP' : 'Lambert_Conformal_Conic_2SP';
}

function wkt_projcs_is_lcc_1sp(projcs) {
  return !wkt_find_parameter_by_name(projcs, 'standard_parallel_2');
}

function wkt_proj4_is_lcc_1sp(P) {
  return !('lat_1' in P.params && 'lat_2' in P.params);
}
