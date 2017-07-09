/* @requires wkt_add, wkt_parameters */

/*
// projections still missing WKT conversion
[
  ['airy', ''],
  ['boggs', ''],
  ['crast', 'Craster_Parabolic'],
  ['gn_sinu', ''],
  ['gstmerc', 'Gauss_Schreiber_Transverse_Mercator'], // https://trac.osgeo.org/gdal/ticket/2663
  ['geos', 'Geostationary_Satellite'],
  ['goode', 'Goode_Homolosine'],
  ['igh', 'Interrupted_Goode_Homolosine'],
  ['imw_p', 'International_Map_of_the_World_Polyconic'],
  ['kav7', ''],
  ['krovak', 'Krovak'],
  ['laborde', 'Laborde_Oblique_Mercator'],
  ['mbtfps', ''],
  ['nell_h', ''],
  ['ocea', ''], // see OneNote notes
  ['qua_aut', 'Quartic_Authalic'],
  ['', 'Swiss_Oblique_Cylindrical'], // http://www.remotesensing.org/geotiff/proj_list/swiss_oblique_cylindrical.html
  ['', 'Transverse_Mercator_South_Orientated'], // http://www.remotesensing.org/geotiff/proj_list/transverse_mercator_south_oriented.html
]
*/

// Add simple conversion functions
// optional third field gives alternate parameters (defined in wkt_parameters.js)
[
  ['aitoff', 'Aitoff', 'lat1'],
  ['aea', 'Albers_Conic_Equal_Area,Albers', 'lat_1,lat_2'],
  ['aeqd', 'Azimuthal_Equidistant'],
  ['bonne', 'Bonne', 'lat_1'],
  ['cass', 'Cassini_Soldner,Cassini'],
  ['cea', 'Cylindrical_Equal_Area', 'lat_ts'],
  ['eck1', 'Eckert_I'],
  ['eck2', 'Eckert_II'],
  ['eck3', 'Eckert_III'],
  ['eck4', 'Eckert_IV'],
  ['eck5', 'Eckert_V'],
  ['eck6', 'Eckert_VI'],
  ['eqdc', 'Equidistant_Conic', 'lat_1,lat_2'],
  ['eqc', 'Plate_Carree,Equirectangular,Equidistant_Cylindrical', 'lat_ts'],
  ['gall', 'Gall_Stereographic'],
  ['gnom', 'Gnomonic'],
  ['laea', 'Lambert_Azimuthal_Equal_Area'],
  ['loxim', 'Loximuthal', 'lat_1'],
  ['mill', 'Miller_Cylindrical'],
  ['moll', 'Mollweide'],
  ['nsper', 'Vertical_Near_Side_Perspective', 'h'],
  ['nzmg', 'New_Zealand_Map_Grid', 'lat_0b'],
  ['ortho', 'Orthographic', 'lat_0b'],
  ['poly', 'Polyconic'],
  ['robin', 'Robinson'],
  ['sinu', 'Sinusoidal'],
  ['sterea', 'Oblique_Stereographic,Double_Stereographic'], // http://geotiff.maptools.org/proj_list/oblique_stereographic.html
  ['tmerc', 'Transverse_Mercator,Gauss_Kruger', 'lat_0b'],
  ['tpeqd', 'Two_Point_Equidistant', 'lat_1b,lat_2b,lon_1,lon_2'],
  // ['vandg', 'VanDerGrinten,Van_der_Grinten_I'], // slight complication, see wkt_vandg.js
  ['wag1', 'Wagner_I'],
  ['wag2', 'Wagner_II'],
  ['wag3', 'Wagner_III', 'lat_ts'],
  ['wag4', 'Wagner_IV'],
  ['wag5', 'Wagner_V'],
  ['wag6', 'Wagner_VI'],
  ['wag7', 'Wagner_VII'],
  ['wink1', 'Winkel_I', 'lat_ts'],
  ['wink2', 'Winkel_II'],
  ['wintri', 'Winkel_Tripel', 'lat_1']
].forEach(function(arr) {
  var alternateParams = arr[2] || null;
  add_simple_wkt_parser(arr[0], arr[1], alternateParams);
  add_simple_wkt_maker(arr[0], arr[1].split(',')[0], alternateParams);
});
