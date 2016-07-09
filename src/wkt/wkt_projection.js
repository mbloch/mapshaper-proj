
// Table for looking up proj4 projection ids from WKT names
// Sources: https://github.com/mapgears/mitab/blob/master/ogr/ogr_srs_api.h
// Entries that are not supported in mapshaper-proj are commented out
// Some proj4 names are handled elswhere (utm, ups)
var wkt_projections = [
  ['aitoff', 'Aitoff'],
  ['aea', 'Albers_Conic_Equal_Area'],
  ['aea', 'Albers'],
  ['aeqd', 'Azimuthal_Equidistant'],
  // ['airy', ''],
  // ['boggs', ''],
  ['cass', 'Cassini_Soldner'],
  ['cass', 'Cassini'],
  ['cea', 'Cylindrical_Equal_Area'],
  // ['crast', 'Craster_Parabolic'],
  ['bonne', 'Bonne'],
  ['eck1', 'Eckert_I'],
  ['eck2', 'Eckert_II'],
  ['eck3', 'Eckert_III'],
  ['eck4', 'Eckert_IV'],
  ['eck5', 'Eckert_V'],
  ['eck6', 'Eckert_VI'],
  ['eqdc', 'Equidistant_Conic'],
  ['eqc', 'Equidistant_Cylindrical'], // ESRI
  ['eqc', 'Plate_Carree'],
  ['eqc', 'Equirectangular'],
  ['gall', 'Gall_Stereographic'],
  // ['gn_sinu', ''],
  // ['gstmerc', 'Gauss_Schreiber_Transverse_Mercator'], // https://trac.osgeo.org/gdal/ticket/2663
  // ['geos', 'Geostationary_Satellite'],
  // ['goode', 'Goode_Homolosine'],
  ['gnom', 'Gnomonic'],
  // ['igh', 'Interrupted_Goode_Homolosine'],
  // ['imw_p', 'International_Map_of_the_World_Polyconic'],
  // ['kav7', ''],
  // ['krovak', 'Krovak'],
  // ['laborde', 'Laborde_Oblique_Mercator'],
  ['lcc', 'Lambert_Conformal_Conic'],
  ['lcc', 'Lambert_Conformal_Conic_1SP'],
  ['lcc', 'Lambert_Conformal_Conic_2SP'],
  ['laea', 'Lambert_Azimuthal_Equal_Area'],
  ['loxim', 'Loximuthal'],
  // ['mbtfps', ''],
  ['merc', 'Mercator'],
  ['merc', 'Mercator_1SP'],
  ['merc', 'Mercator_2SP'], // http://www.remotesensing.org/geotiff/proj_list/mercator_2sp.html
  ['merc', 'Mercator_Auxiliary_Sphere'],
  ['mill', 'Miller_Cylindrical'],
  ['moll', 'Mollweide'],
  // ['nell_h', ''],
  // ['nzmg', 'New_Zealand_Map_Grid'],
  ['nsper', 'Vertical_Near_Side_Perspective'],
  ['omerc', 'Hotine_Oblique_Mercator'], // A
  ['omerc', 'Hotine_Oblique_Mercator_Azimuth_Natural_Origin'], // A
  ['omerc', 'Oblique_Mercator'], // B
  ['omerc', 'Hotine_Oblique_Mercator_Two_Point_Natural_Origin'],
  ['omerc', 'Hotine_Oblique_Mercator_Azimuth_Center'], // B
  ['ortho', 'Orthographic'],
  ['poly', 'Polyconic'],
  // ['qua_aut', 'Quartic_Authalic'],
  ['robin', 'Robinson'],
  ['sinu', 'Sinusoidal'],
  ['stere', 'Stereographic'],
  ['stere', 'Stereographic_North_Pole'], // ESRI
  ['stere', 'Stereographic_South_Pole'], // ESRI
  ['stere', 'Polar_Stereographic'],
  ['sterea', 'Double_Stereographic'], // ESRI
  ['sterea', 'Oblique_Stereographic'], // http://www.remotesensing.org/geotiff/proj_list/oblique_stereographic.html
  // ['', 'Swiss_Oblique_Cylindrical'], // http://www.remotesensing.org/geotiff/proj_list/swiss_oblique_cylindrical.html
  ['tmerc', 'Transverse_Mercator'],
  // ['', 'Transverse_Mercator_South_Orientated'], // http://www.remotesensing.org/geotiff/proj_list/transverse_mercator_south_oriented.html
  ['tpeqd', 'Two_Point_Equidistant'],
  ['vandg', 'VanDerGrinten'],
  ['vandg', 'Van_der_Grinten_I'], // ESRI
  ['wag1', 'Wagner_I'],
  ['wag2', 'Wagner_II'],
  ['wag3', 'Wagner_III'],
  ['wag4', 'Wagner_IV'],
  ['wag5', 'Wagner_V'],
  ['wag6', 'Wagner_VI'],
  ['wag7', 'Wagner_VII'],
  ['wink1', 'Winkel_I'],
  ['wink2', 'Winkel_II'],
  ['wintri', 'Winkel_Tripel'],
  []
];

function wkt_get_proj(name) {
  var defn, i;
  for (i=0; i<wkt_projections.length; i++) {
    defn = wkt_projections[i];
    if (defn[1] == name) {
      return {proj: defn[0], wkt: defn[1]};
    }
  }
  return null;
}
