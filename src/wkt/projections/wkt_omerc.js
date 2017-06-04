/* @requires wkt_add */

// Type A
add_wkt_parser(
  get_simple_parser_test('Hotine_Oblique_Mercator,Hotine_Oblique_Mercator_Azimuth_Natural_Origin'),
  wkt_projcs_converter({
    PROJECTION: wkt_simple_projection_converter('omerc'),
    PARAMETER: function(P) {return wkt_parameter_converter('alpha,gamma,lonc')(P) + ' +no_uoff';}
  })
);
add_wkt_maker(wkt_proj4_is_omerc_A, wkt_simple_projcs_maker('Hotine_Oblique_Mercator', 'alpha,gamma,lonc'));

// Type B
add_simple_wkt_parser('omerc', 'Oblique_Mercator,Hotine_Oblique_Mercator_Azimuth_Center', 'alpha,gamma,lonc');
add_wkt_maker(wkt_proj4_is_omerc_B, wkt_simple_projcs_maker('Oblique_Mercator', 'alpha,gamma,lonc'));

// Two-point version
add_simple_wkt_parser('omerc', 'Hotine_Oblique_Mercator_Two_Point_Natural_Origin', 'lat_1b,lat_2b,lon_1,lon_2');
add_wkt_maker(
  wkt_proj4_is_omerc_2pt,
  wkt_simple_projcs_maker('Hotine_Oblique_Mercator_Two_Point_Natural_Origin', 'lat_1b,lat_2b,lon_1,lon_2')
);

function wkt_proj4_is_omerc_2pt(P) {
  return get_proj_id(P) == 'omerc' && 'lat_2' in P.params && 'lon_2' in P.params;
}

function wkt_proj4_is_omerc(P) {
  return get_proj_id(P) == 'omerc' && ('alpha' in P.params || 'gamma' in P.params);
}

function wkt_proj4_is_omerc_A(P) {
  return wkt_proj4_is_omerc(P) && ('no_uoff' in P.params || 'no_off' in P.params);
}

function wkt_proj4_is_omerc_B(P) {
  return wkt_proj4_is_omerc(P) && !wkt_proj4_is_omerc_A(P);
}
