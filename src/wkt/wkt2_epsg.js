/* @requires wkt_common */

// PROTOTYPE: EPSG code lookup tables for WKT2 conversion.
//
// Keyed on EPSG method and parameter codes (stable across WKT2:2015 and
// :2019). When a WKT2 document provides ID["EPSG", N] on a METHOD or
// PARAMETER element, these tables are the primary dispatch.
//
// Name-based fallbacks (for WKT2 documents missing IDs) live in
// wkt2_method_name_map / wkt2_parameter_name_map below.

// --- Method code -> target WKT1 projection name -----------------------------
//
// Most methods normalize into the WKT1 object shape that the existing
// src/wkt/projections/ adapters match on. A few (sphere, somerc, krovak)
// need special handling during normalize; see `special` flag.

var wkt2_method_table = {
  // Transverse Mercator family
  9807: {wkt1: 'Transverse_Mercator'},
  9808: {wkt1: 'Transverse_Mercator_South_Orientated'}, // unsupported downstream today
  // Mercator family
  9804: {wkt1: 'Mercator_1SP'},         // variant A: scale factor at equator
  9805: {wkt1: 'Mercator_2SP'},         // variant B: standard parallel
  1024: {wkt1: 'Mercator_Auxiliary_Sphere', special: 'aux_sphere'},
                                        // "Popular Visualisation Pseudo Mercator"
  1026: {wkt1: 'Mercator_1SP'},         // Spherical Mercator
  // Lambert Conic Conformal family
  9801: {wkt1: 'Lambert_Conformal_Conic_1SP'},
  9802: {wkt1: 'Lambert_Conformal_Conic_2SP'},
  9803: {wkt1: 'Lambert_Conformal_Conic_2SP'}, // 2SP Belgium; treated same here
  // Albers
  9822: {wkt1: 'Albers_Conic_Equal_Area'},
  // LAEA
  9820: {wkt1: 'Lambert_Azimuthal_Equal_Area'},
  1027: {wkt1: 'Lambert_Azimuthal_Equal_Area'}, // Spherical LAEA
  // Stereographic
  9809: {wkt1: 'Oblique_Stereographic'},
  9810: {wkt1: 'Polar_Stereographic'},  // variant A
  9829: {wkt1: 'Polar_Stereographic'},  // variant B
  9830: {wkt1: 'Polar_Stereographic'},  // variant C
  // Other conformal
  9819: {wkt1: 'Krovak', special: 'krovak'},
  1041: {wkt1: 'Krovak', special: 'krovak_north'},
  // Oblique Mercator -- Hotine / Swiss
  9812: {wkt1: 'Hotine_Oblique_Mercator'},
  9815: {special: 'somerc'}, // Hotine Oblique Mercator variant B; PROJ uses +proj=somerc
  // Van der Grinten (no standard EPSG code, uses generic)
  // Equirectangular / Plate Carree
  9825: {wkt1: 'Plate_Carree'}, // Pseudo Plate Carree -- approximate
  1028: {wkt1: 'Equidistant_Cylindrical'},
  1029: {wkt1: 'Equidistant_Cylindrical'}, // spherical
  // Cylindrical Equal Area
  9834: {wkt1: 'Cylindrical_Equal_Area'},
  9835: {wkt1: 'Cylindrical_Equal_Area'}, // ellipsoidal
  // Equidistant Conic
  1119: {wkt1: 'Equidistant_Conic'}, // EPSG uses a different code in some releases
  // Azimuthal Equidistant
  1125: {wkt1: 'Azimuthal_Equidistant'}, // spherical; ellipsoidal uses 9832
  9832: {wkt1: 'Azimuthal_Equidistant'}, // Modified Azimuthal Equidistant
  // Vertical Near Side Perspective
  9838: {wkt1: 'Vertical_Near_Side_Perspective'},
  9839: {wkt1: 'Vertical_Near_Side_Perspective'}, // true spherical
  // New Zealand Map Grid
  9811: {wkt1: 'New_Zealand_Map_Grid'}
};

// Fallback: when no EPSG method ID is present, match on the method name.
// Normalization is lowercase + strip non-alphanumerics.
var wkt2_method_name_map = {
  'transversemercator':               'Transverse_Mercator',
  'mercator1sp':                      'Mercator_1SP',
  'mercator2sp':                      'Mercator_2SP',
  'mercatorvarianta':                 'Mercator_1SP',
  'mercatorvariantb':                 'Mercator_2SP',
  'popularvisualisationpseudomercator': 'Mercator_Auxiliary_Sphere',
  'lambertconicconformal1sp':         'Lambert_Conformal_Conic_1SP',
  'lambertconicconformal2sp':         'Lambert_Conformal_Conic_2SP',
  'lambertconicconformal':            'Lambert_Conformal_Conic',
  'lambertazimuthalequalarea':        'Lambert_Azimuthal_Equal_Area',
  'albersequalarea':                  'Albers_Conic_Equal_Area',
  'obliquestereographic':             'Oblique_Stereographic',
  'polarstereographicvarianta':       'Polar_Stereographic',
  'polarstereographicvariantb':       'Polar_Stereographic',
  'polarstereographicvariantc':       'Polar_Stereographic',
  'polarstereographic':               'Polar_Stereographic',
  'hotineobliquemercator':            'Hotine_Oblique_Mercator',
  'hotineobliquemercatorvarianta':    'Hotine_Oblique_Mercator',
  'hotineobliquemercatorvariantb':    'Oblique_Mercator',
  'obliquemercator':                  'Oblique_Mercator',
  'krovak':                           'Krovak',
  'krovaknorthorientated':            'Krovak',
  'newzealandmapgrid':                'New_Zealand_Map_Grid',

  // Simple projections. Each name is in lowercase-alphanumeric form.
  'cassinisoldner':                   'Cassini_Soldner',
  'cassini':                          'Cassini_Soldner',
  'equidistantconic':                 'Equidistant_Conic',
  'equidistantcylindrical':           'Equidistant_Cylindrical',
  'mollweide':                        'Mollweide',
  'sinusoidal':                       'Sinusoidal',
  'robinson':                         'Robinson',
  'vandergrinten':                    'VanDerGrinten',
  'vandergrinteni':                   'VanDerGrinten',
  'winkeltripel':                     'Winkel_Tripel',
  'aitoff':                           'Aitoff',
  'bonne':                            'Bonne',
  'lambertcylindricalequalarea':      'Cylindrical_Equal_Area',
  'gallstereographic':                'Gall_Stereographic',
  'millercylindrical':                'Miller_Cylindrical',
  'loximuthal':                       'Loximuthal',
  'orthographic':                     'Orthographic',
  'americanpolyconic':                'Polyconic',
  'polyconic':                        'Polyconic',
  'gnomonic':                         'Gnomonic',
  'eckerti':                          'Eckert_I',
  'eckertii':                         'Eckert_II',
  'eckertiii':                        'Eckert_III',
  'eckertiv':                         'Eckert_IV',
  'eckertv':                          'Eckert_V',
  'eckertvi':                         'Eckert_VI',
  'wagneri':                          'Wagner_I',
  'wagnerii':                         'Wagner_II',
  'wagneriii':                        'Wagner_III',
  'wagneriv':                         'Wagner_IV',
  'wagnerv':                          'Wagner_V',
  'wagnervi':                         'Wagner_VI',
  'wagnervii':                        'Wagner_VII',
  'winkeli':                          'Winkel_I',
  'winkelii':                         'Winkel_II',
  'twopointequidistant':              'Two_Point_Equidistant',
  'hotineobliquemercatortwopointnaturalorigin': 'Hotine_Oblique_Mercator_Two_Point_Natural_Origin',
  'verticalperspective':              'Vertical_Near_Side_Perspective',
  'verticalnearsideperspective':      'Vertical_Near_Side_Perspective'
};

// --- Parameter code -> WKT1 (OGC) parameter name ---------------------------
//
// These names are the strings the existing projection adapters in
// src/wkt/projections/ match on via wkt_parameter_converter rules.
//
// A few codes are used in multiple contexts (e.g. 8806 = False easting, used
// for natural-origin *and* projection-centre projections). The meaning is
// always "false easting", so a single mapping works.

var wkt2_parameter_table = {
  // Natural origin (TM, Mercator variant A, 1SP LCC, etc.)
  8801: 'latitude_of_origin',        // Latitude of natural origin
  8802: 'central_meridian',          // Longitude of natural origin
  8805: 'scale_factor',              // Scale factor at natural origin
  8806: 'false_easting',             // False easting
  8807: 'false_northing',            // False northing

  // False origin (LCC 2SP, Albers)
  8821: 'latitude_of_origin',        // Latitude of false origin
  8822: 'central_meridian',          // Longitude of false origin
  8823: 'standard_parallel_1',       // Latitude of 1st standard parallel
  8824: 'standard_parallel_2',       // Latitude of 2nd standard parallel
  8826: 'false_easting',             // Easting at false origin
  8827: 'false_northing',            // Northing at false origin

  // Projection centre (Hotine Oblique Mercator, Krovak, LAEA variant)
  8811: 'latitude_of_center',        // Latitude of projection centre
  8812: 'longitude_of_center',       // Longitude of projection centre
  8813: 'azimuth',                   // Azimuth at projection centre
  8814: 'rectified_grid_angle',      // Angle from Rectified to Skew Grid
  8815: 'scale_factor',              // Scale factor at projection centre
  8816: 'false_easting',             // Easting at projection centre
  8817: 'false_northing',            // Northing at projection centre
  8818: 'pseudo_standard_parallel_1',// Latitude of pseudo standard parallel
  8819: 'scale_factor',              // Scale factor on pseudo standard parallel

  // Polar Stereographic variant B
  8832: 'standard_parallel_1',       // Latitude of standard parallel
  8833: 'central_meridian',          // Longitude of origin

  // Mercator variant B
  // 8823 above doubles for "Latitude of 1st standard parallel" here

  // Krovak-specific
  1036: 'azimuth',                   // Co-latitude of cone axis
  1051: 'azimuth',                   // Co-latitude, 2nd EPSG code

  // Vertical near-side perspective
  8840: 'height'                     // Viewpoint height
};

// Fallback parameter name map for IDless input. Normalized to lowercase
// alphanumerics-only, same as method names.
var wkt2_parameter_name_map = {
  'latitudeofnaturalorigin':           'latitude_of_origin',
  'longitudeofnaturalorigin':          'central_meridian',
  'scalefactoratnaturalorigin':        'scale_factor',
  'falseeasting':                      'false_easting',
  'falsenorthing':                     'false_northing',
  'latitudeoffalseorigin':             'latitude_of_origin',
  'longitudeoffalseorigin':            'central_meridian',
  'latitudeof1ststandardparallel':     'standard_parallel_1',
  'latitudeof2ndstandardparallel':     'standard_parallel_2',
  'eastingatfalseorigin':              'false_easting',
  'northingatfalseorigin':             'false_northing',
  'latitudeofprojectioncentre':        'latitude_of_center',
  'longitudeofprojectioncentre':       'longitude_of_center',
  'azimuthofinitialline':              'azimuth',
  'azimuthatprojectioncentre':         'azimuth',
  'anglefromrectifiedtoskewgrid':      'rectified_grid_angle',
  'scalefactoratprojectioncentre':     'scale_factor',
  'eastingatprojectioncentre':         'false_easting',
  'northingatprojectioncentre':        'false_northing',
  'latitudeofpseudostandardparallel':  'pseudo_standard_parallel_1',
  'scalefactoronpseudostandardparallel': 'scale_factor',
  'latitudeofstandardparallel':        'standard_parallel_1',
  'longitudeoforigin':                 'central_meridian',
  'colatitudeofconeaxis':              'azimuth',
  'viewpointheight':                   'height',
  'latitudeof1stpoint':                'latitude_of_point_1',
  'longitudeof1stpoint':               'longitude_of_point_1',
  'latitudeof2ndpoint':                'latitude_of_point_2',
  'longitudeof2ndpoint':               'longitude_of_point_2'
};

function wkt2_normalize_name(s) {
  return (s || '').replace(/[^A-Za-z0-9]/g, '').toLowerCase();
}

// Given a METHOD or PARAMETER node, return the WKT1-equivalent name (or
// null if unknown).
function wkt2_lookup_method(methodNode) {
  if (!methodNode) return null;
  var codeAuthority = wkt2_id_authority(methodNode);
  var code = wkt2_id_code(methodNode);
  if (code != null && (!codeAuthority || /^EPSG$/i.test(codeAuthority)) &&
      wkt2_method_table[code]) {
    return wkt2_method_table[code];
  }
  var name = wkt2_name_of(methodNode);
  var key = wkt2_normalize_name(name);
  if (wkt2_method_name_map[key]) {
    return {wkt1: wkt2_method_name_map[key]};
  }
  return null;
}

function wkt2_lookup_parameter(paramNode) {
  var code = wkt2_id_code(paramNode);
  if (code != null && wkt2_parameter_table[code]) {
    return wkt2_parameter_table[code];
  }
  var name = wkt2_name_of(paramNode);
  var key = wkt2_normalize_name(name);
  if (wkt2_parameter_name_map[key]) {
    return wkt2_parameter_name_map[key];
  }
  return null;
}
