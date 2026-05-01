/* @requires
wkt_make_projcs
wkt_make_geogcs
wkt_common
pj_init
*/

// PROTOTYPE: Build a WKT2 tree (same nested-array shape wkt2_parse produces)
// from a pj_init() projection struct. The shape lets wkt2_stringify render
// it as text without knowing anything about conversion semantics.
//
// The WKT2 tree emitted here targets WKT2:2019 but is intentionally
// conservative: keywords that are shared with WKT2:2015 are preferred
// (PROJCRS, BASEGEOGCRS, DATUM, ELLIPSOID, PRIMEM, CS, AXIS, LENGTHUNIT,
// ANGLEUNIT, SCALEUNIT, CONVERSION, METHOD, PARAMETER, ID).
//
// `ID[EPSG, N]` is emitted on METHOD, PARAMETER, and the three geodetic
// elements (ELLIPSOID, PRIMEM, BASEGEOGCRS) where the mapping is stable
// via small static tables. It is NOT emitted on the top-level PROJCRS/
// GEOGCRS or on DATUM, where a correct reverse lookup would require the
// full EPSG database.

// --- Method emission table -------------------------------------------------
//
// Keyed on the WKT1 PROJECTION name that wkt_make_projcs produces. Each
// entry lists the parameter shortcut keys (see wkt2_make_param_defs) in
// the order expected by the EPSG method definition.

var wkt2_make_method_defs = {
  Transverse_Mercator: {
    epsg: 9807,
    name: 'Transverse Mercator',
    params: ['tm_lat_0', 'tm_lon_0', 'tm_k', 'tm_fe', 'tm_fn']
  },
  Gauss_Kruger: {
    epsg: 9807,
    name: 'Transverse Mercator',
    params: ['tm_lat_0', 'tm_lon_0', 'tm_k', 'tm_fe', 'tm_fn']
  },
  Lambert_Conformal_Conic_1SP: {
    epsg: 9801,
    name: 'Lambert Conic Conformal (1SP)',
    params: ['tm_lat_0', 'tm_lon_0', 'tm_k', 'tm_fe', 'tm_fn']
  },
  Lambert_Conformal_Conic_2SP: {
    epsg: 9802,
    name: 'Lambert Conic Conformal (2SP)',
    params: ['lcc2_lat_f', 'lcc2_lon_f', 'lcc2_sp1', 'lcc2_sp2', 'lcc2_fe', 'lcc2_fn']
  },
  Lambert_Conformal_Conic: {
    epsg: 9802,
    name: 'Lambert Conic Conformal (2SP)',
    params: ['lcc2_lat_f', 'lcc2_lon_f', 'lcc2_sp1', 'lcc2_sp2', 'lcc2_fe', 'lcc2_fn']
  },
  Mercator_1SP: {
    epsg: 9804,
    name: 'Mercator (variant A)',
    params: ['tm_lat_0', 'tm_lon_0', 'tm_k', 'tm_fe', 'tm_fn']
  },
  Mercator_2SP: {
    epsg: 9805,
    name: 'Mercator (variant B)',
    params: ['merc2_sp1', 'tm_lon_0', 'tm_fe', 'tm_fn']
  },
  Mercator_Auxiliary_Sphere: {
    epsg: 1024,
    name: 'Popular Visualisation Pseudo Mercator',
    params: ['tm_lat_0', 'tm_lon_0', 'tm_fe', 'tm_fn']
  },
  Lambert_Azimuthal_Equal_Area: {
    epsg: 9820,
    name: 'Lambert Azimuthal Equal Area',
    params: ['laea_lat_0', 'laea_lon_0', 'tm_fe', 'tm_fn']
  },
  Albers_Conic_Equal_Area: {
    epsg: 9822,
    name: 'Albers Equal Area',
    params: ['aea_lat_f', 'aea_lon_f', 'lcc2_sp1', 'lcc2_sp2', 'lcc2_fe', 'lcc2_fn']
  },
  Albers: {
    epsg: 9822,
    name: 'Albers Equal Area',
    params: ['aea_lat_f', 'aea_lon_f', 'lcc2_sp1', 'lcc2_sp2', 'lcc2_fe', 'lcc2_fn']
  },
  Polar_Stereographic: {
    epsg: 9810,
    name: 'Polar Stereographic (variant A)',
    params: ['tm_lat_0', 'tm_lon_0', 'tm_k', 'tm_fe', 'tm_fn']
  },
  Stereographic_North_Pole: {
    epsg: 9829,
    name: 'Polar Stereographic (variant B)',
    params: ['ps_sp', 'ps_lon_0', 'tm_fe', 'tm_fn']
  },
  Stereographic_South_Pole: {
    epsg: 9829,
    name: 'Polar Stereographic (variant B)',
    params: ['ps_sp', 'ps_lon_0', 'tm_fe', 'tm_fn']
  },
  Oblique_Stereographic: {
    epsg: 9809,
    name: 'Oblique Stereographic',
    params: ['tm_lat_0', 'tm_lon_0', 'tm_k', 'tm_fe', 'tm_fn']
  },
  Stereographic: {
    epsg: 9809,
    name: 'Oblique Stereographic',
    params: ['tm_lat_0', 'tm_lon_0', 'tm_k', 'tm_fe', 'tm_fn']
  },
  Hotine_Oblique_Mercator: {
    epsg: 9812,
    name: 'Hotine Oblique Mercator (variant A)',
    params: ['omerc_lat_0', 'omerc_lon_0', 'omerc_az', 'omerc_ra', 'omerc_k',
             'tm_fe', 'tm_fn']
  },
  Krovak: {
    epsg: 1041,
    name: 'Krovak (North Orientated)',
    params: ['omerc_lat_0', 'ps_lon_0', 'krovak_alpha', 'krovak_sp',
             'krovak_k', 'tm_fe', 'tm_fn']
  },

  // Simple projections -- `epsg` is set only for methods that have a
  // stable EPSG code. Others emit METHOD["name"] without an ID.
  Azimuthal_Equidistant:       {name: 'Modified Azimuthal Equidistant', epsg: 9832,
                                params: ['tm_lat_0', 'tm_lon_0', 'tm_fe', 'tm_fn']},
  Cassini_Soldner:             {name: 'Cassini-Soldner', epsg: 9806,
                                params: ['tm_lat_0', 'tm_lon_0', 'tm_fe', 'tm_fn']},
  Cassini:                     {name: 'Cassini-Soldner', epsg: 9806,
                                params: ['tm_lat_0', 'tm_lon_0', 'tm_fe', 'tm_fn']},
  Equidistant_Conic:           {name: 'Equidistant Conic',
                                params: ['tm_lat_0', 'tm_lon_0', 'lcc2_sp1', 'lcc2_sp2', 'tm_fe', 'tm_fn']},
  Equirectangular:             {name: 'Equidistant Cylindrical', epsg: 1028,
                                params: ['ps_sp', 'tm_lon_0', 'tm_fe', 'tm_fn']},
  Equidistant_Cylindrical:     {name: 'Equidistant Cylindrical', epsg: 1028,
                                params: ['ps_sp', 'tm_lon_0', 'tm_fe', 'tm_fn']},
  Plate_Carree:                {name: 'Equidistant Cylindrical', epsg: 1028,
                                params: ['ps_sp', 'tm_lon_0', 'tm_fe', 'tm_fn']},
  Mollweide:                   {name: 'Mollweide',
                                params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Sinusoidal:                  {name: 'Sinusoidal',
                                params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Robinson:                    {name: 'Robinson',
                                params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Gnomonic:                    {name: 'Gnomonic',
                                params: ['tm_lat_0', 'tm_lon_0', 'tm_fe', 'tm_fn']},
  Orthographic:                {name: 'Orthographic', epsg: 9840,
                                params: ['tm_lat_0', 'tm_lon_0', 'tm_fe', 'tm_fn']},
  Polyconic:                   {name: 'American Polyconic', epsg: 9818,
                                params: ['tm_lat_0', 'tm_lon_0', 'tm_fe', 'tm_fn']},
  Aitoff:                      {name: 'Aitoff',
                                params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Bonne:                       {name: 'Bonne', epsg: 9827,
                                params: ['tm_lat_0', 'tm_lon_0', 'tm_fe', 'tm_fn']},
  Cylindrical_Equal_Area:      {name: 'Lambert Cylindrical Equal Area', epsg: 9835,
                                params: ['ps_sp', 'tm_lon_0', 'tm_fe', 'tm_fn']},
  Gall_Stereographic:          {name: 'Gall Stereographic',
                                params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Miller_Cylindrical:          {name: 'Miller Cylindrical',
                                params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Loximuthal:                  {name: 'Loximuthal',
                                params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  New_Zealand_Map_Grid:        {name: 'New Zealand Map Grid', epsg: 9811,
                                params: ['tm_lat_0', 'tm_lon_0', 'tm_fe', 'tm_fn']},
  Vertical_Near_Side_Perspective: {name: 'Vertical Perspective', epsg: 9838,
                                params: ['tm_lat_0', 'tm_lon_0', 'tm_height', 'tm_fe', 'tm_fn']},
  VanDerGrinten:               {name: 'Van der Grinten',
                                params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Van_der_Grinten_I:           {name: 'Van der Grinten I',
                                params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Winkel_Tripel:               {name: 'Winkel Tripel',
                                params: ['ps_sp', 'tm_lon_0', 'tm_fe', 'tm_fn']},
  Winkel_I:                    {name: 'Winkel I',
                                params: ['ps_sp', 'tm_lon_0', 'tm_fe', 'tm_fn']},
  Winkel_II:                   {name: 'Winkel II',
                                params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Eckert_I:                    {name: 'Eckert I', params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Eckert_II:                   {name: 'Eckert II', params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Eckert_III:                  {name: 'Eckert III', params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Eckert_IV:                   {name: 'Eckert IV', params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Eckert_V:                    {name: 'Eckert V', params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Eckert_VI:                   {name: 'Eckert VI', params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Wagner_I:                    {name: 'Wagner I', params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Wagner_II:                   {name: 'Wagner II', params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Wagner_III:                  {name: 'Wagner III', params: ['ps_sp', 'tm_lon_0', 'tm_fe', 'tm_fn']},
  Wagner_IV:                   {name: 'Wagner IV', params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Wagner_V:                    {name: 'Wagner V', params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Wagner_VI:                   {name: 'Wagner VI', params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Wagner_VII:                  {name: 'Wagner VII', params: ['tm_lon_0', 'tm_fe', 'tm_fn']},
  Two_Point_Equidistant:       {name: 'Two Point Equidistant',
                                params: ['tpeqd_lat_1', 'tpeqd_lon_1', 'tpeqd_lat_2', 'tpeqd_lon_2', 'tm_fe', 'tm_fn']},
  Hotine_Oblique_Mercator_Two_Point_Natural_Origin:
                               {name: 'Hotine Oblique Mercator Two Point Natural Origin',
                                params: ['tm_lat_0', 'tpeqd_lat_1', 'tpeqd_lon_1', 'tpeqd_lat_2', 'tpeqd_lon_2', 'tm_fe', 'tm_fn']},
  Oblique_Mercator:            {name: 'Hotine Oblique Mercator (variant B)', epsg: 9815,
                                params: ['omerc_lat_0', 'omerc_lon_0', 'omerc_az', 'omerc_ra', 'omerc_k',
                                         'omerc_fe', 'omerc_fn']},
  Double_Stereographic:        {name: 'Oblique Stereographic', epsg: 9809,
                                params: ['tm_lat_0', 'tm_lon_0', 'tm_k', 'tm_fe', 'tm_fn']}
};

// --- Parameter definitions -------------------------------------------------
//
// `unit`: 'angle' | 'length' | 'scale'
// `default`: value used when the WKT1 object omits this parameter
// `wkt1`:    parameter name in the WKT1 maker output

var wkt2_make_param_defs = {
  tm_lat_0:  {wkt1: 'latitude_of_origin',  wkt2: 'Latitude of natural origin',     epsg: 8801, unit: 'angle',  default: 0,
              wkt1_fallback: 'latitude_of_center'},
  tm_lon_0:  {wkt1: 'central_meridian',    wkt2: 'Longitude of natural origin',    epsg: 8802, unit: 'angle',  default: 0,
              wkt1_fallback: 'longitude_of_center'},
  tm_k:      {wkt1: 'scale_factor',        wkt2: 'Scale factor at natural origin', epsg: 8805, unit: 'scale',  default: 1},
  tm_fe:     {wkt1: 'false_easting',       wkt2: 'False easting',                  epsg: 8806, unit: 'length', default: 0},
  tm_fn:     {wkt1: 'false_northing',      wkt2: 'False northing',                 epsg: 8807, unit: 'length', default: 0},

  lcc2_lat_f:{wkt1: 'latitude_of_origin',  wkt2: 'Latitude of false origin',       epsg: 8821, unit: 'angle',  default: 0},
  lcc2_lon_f:{wkt1: 'central_meridian',    wkt2: 'Longitude of false origin',      epsg: 8822, unit: 'angle',  default: 0},
  lcc2_sp1:  {wkt1: 'standard_parallel_1', wkt2: 'Latitude of 1st standard parallel', epsg: 8823, unit: 'angle', default: 0},
  lcc2_sp2:  {wkt1: 'standard_parallel_2', wkt2: 'Latitude of 2nd standard parallel', epsg: 8824, unit: 'angle', default: 0},
  lcc2_fe:   {wkt1: 'false_easting',       wkt2: 'Easting at false origin',        epsg: 8826, unit: 'length', default: 0},
  lcc2_fn:   {wkt1: 'false_northing',      wkt2: 'Northing at false origin',       epsg: 8827, unit: 'length', default: 0},

  // LAEA uses "Latitude of natural origin" in EPSG (8801); WKT1 names it
  // latitude_of_center (thanks to wkt_parameter_aliases).
  laea_lat_0:{wkt1: 'latitude_of_center',  wkt2: 'Latitude of natural origin',     epsg: 8801, unit: 'angle',  default: 0,
              wkt1_fallback: 'latitude_of_origin'},
  laea_lon_0:{wkt1: 'longitude_of_center', wkt2: 'Longitude of natural origin',    epsg: 8802, unit: 'angle',  default: 0,
              wkt1_fallback: 'central_meridian'},

  // Albers uses "Latitude of false origin" (8821); WKT1 names it
  // latitude_of_center.
  aea_lat_f: {wkt1: 'latitude_of_center',  wkt2: 'Latitude of false origin',       epsg: 8821, unit: 'angle',  default: 0,
              wkt1_fallback: 'latitude_of_origin'},
  aea_lon_f: {wkt1: 'central_meridian',    wkt2: 'Longitude of false origin',      epsg: 8822, unit: 'angle',  default: 0,
              wkt1_fallback: 'longitude_of_center'},

  merc2_sp1: {wkt1: 'standard_parallel_1', wkt2: 'Latitude of 1st standard parallel', epsg: 8823, unit: 'angle', default: 0},

  ps_sp:     {wkt1: 'standard_parallel_1', wkt2: 'Latitude of standard parallel',  epsg: 8832, unit: 'angle',  default: 0},
  ps_lon_0:  {wkt1: 'central_meridian',    wkt2: 'Longitude of origin',            epsg: 8833, unit: 'angle',  default: 0},

  omerc_lat_0:{wkt1: 'latitude_of_center', wkt2: 'Latitude of projection centre',  epsg: 8811, unit: 'angle',  default: 0,
               wkt1_fallback: 'latitude_of_origin'},
  omerc_lon_0:{wkt1: 'longitude_of_center',wkt2: 'Longitude of projection centre', epsg: 8812, unit: 'angle',  default: 0,
               wkt1_fallback: 'central_meridian'},
  omerc_az:  {wkt1: 'azimuth',             wkt2: 'Azimuth of initial line',        epsg: 8813, unit: 'angle',  default: 0},
  omerc_ra:  {wkt1: 'rectified_grid_angle',wkt2: 'Angle from Rectified to Skew Grid', epsg: 8814, unit: 'angle', default: 0,
              skipIfAbsent: true},
  omerc_k:   {wkt1: 'scale_factor',        wkt2: 'Scale factor on initial line',   epsg: 8815, unit: 'scale',  default: 1},
  omerc_fe:  {wkt1: 'false_easting',       wkt2: 'Easting at projection centre',   epsg: 8816, unit: 'length', default: 0},
  omerc_fn:  {wkt1: 'false_northing',      wkt2: 'Northing at projection centre',  epsg: 8817, unit: 'length', default: 0},

  tm_height: {wkt1: 'height',              wkt2: 'Viewpoint height',               epsg: 8840, unit: 'length', default: 1000000},

  tpeqd_lat_1:{wkt1: 'latitude_of_point_1',wkt2: 'Latitude of 1st point',          unit: 'angle',  default: 0},
  tpeqd_lon_1:{wkt1: 'longitude_of_point_1',wkt2:'Longitude of 1st point',         unit: 'angle',  default: 0},
  tpeqd_lat_2:{wkt1: 'latitude_of_point_2',wkt2: 'Latitude of 2nd point',          unit: 'angle',  default: 0},
  tpeqd_lon_2:{wkt1: 'longitude_of_point_2',wkt2:'Longitude of 2nd point',         unit: 'angle',  default: 0},

  krovak_alpha:{wkt1: 'azimuth',           wkt2: 'Co-latitude of cone axis',       epsg: 1036, unit: 'angle',  default: 30.2881397527778},
  krovak_sp:   {wkt1: 'pseudo_standard_parallel_1', wkt2: 'Latitude of pseudo standard parallel', epsg: 8818, unit: 'angle', default: 78.5},
  krovak_k:    {wkt1: 'scale_factor',      wkt2: 'Scale factor on pseudo standard parallel', epsg: 8819, unit: 'scale', default: 1}
};

// --- Geodetic emission tables ----------------------------------------------

// Proj4 datum id -> WKT2 emitter metadata. When the datum is not in this
// table we fall back to DATUM[<wkt1Name-with-spaces>] with no ID.
var wkt2_datum_emitters = {
  WGS84: {
    baseGeogCrsId: 4326,
    baseGeogCrsName: 'WGS 84',
    ensemble: true,
    ensembleId: 6326,
    ensembleName: 'World Geodetic System 1984 ensemble',
    datumName: 'World Geodetic System 1984'
  },
  NAD83: {
    baseGeogCrsId: 4269,
    baseGeogCrsName: 'NAD83',
    datumName: 'North American Datum 1983'
  },
  NAD27: {
    baseGeogCrsId: 4267,
    baseGeogCrsName: 'NAD27',
    datumName: 'North American Datum 1927'
  },
  OSGB36: {
    baseGeogCrsId: 4277,
    baseGeogCrsName: 'OSGB36',
    datumName: 'OSGB 1936'
  },
  potsdam: {
    baseGeogCrsId: 4314,
    baseGeogCrsName: 'DHDN',
    datumName: 'Deutsches Hauptdreiecksnetz'
  },
  GGRS87: {
    baseGeogCrsId: 4121,
    baseGeogCrsName: 'GGRS87',
    datumName: 'Greek Geodetic Reference System 1987'
  },
  hermannskogel: {
    baseGeogCrsId: 4312,
    baseGeogCrsName: 'MGI',
    datumName: 'Militar-Geographische Institut'
  },
  ire65: {
    baseGeogCrsId: 4299,
    baseGeogCrsName: 'TM65',
    datumName: 'Geodetic Datum of 1965'
  },
  nzgd49: {
    baseGeogCrsId: 4272,
    baseGeogCrsName: 'NZGD49',
    datumName: 'New Zealand Geodetic Datum 1949'
  },
  carthage: {
    baseGeogCrsId: 4223,
    baseGeogCrsName: 'Carthage',
    datumName: 'Carthage'
  }
};

// Proj4 ellps id -> canonical WKT2 name + EPSG code
var wkt2_ellps_info = {
  WGS84:     {epsg: 7030, name: 'WGS 84'},
  GRS80:     {epsg: 7019, name: 'GRS 1980'},
  GRS67:     {epsg: 7036, name: 'GRS 1967'},
  airy:      {epsg: 7001, name: 'Airy 1830'},
  mod_airy:  {epsg: 7002, name: 'Airy Modified 1849'},
  bessel:    {epsg: 7004, name: 'Bessel 1841'},
  bess_nam:  {epsg: 7046, name: 'Bessel Namibia (GLM)'},
  clrk66:    {epsg: 7008, name: 'Clarke 1866'},
  clrk80:    {epsg: 7034, name: 'Clarke 1880'},
  clrk80ign: {epsg: 7011, name: 'Clarke 1880 (IGN)'},
  intl:      {epsg: 7022, name: 'International 1924'},
  WGS72:     {epsg: 7043, name: 'WGS 72'},
  krass:     {epsg: 7024, name: 'Krassowsky 1940'},
  aust_SA:   {epsg: 7003, name: 'Australian National Spheroid'},
  evrstSS:   {epsg: 7016, name: 'Everest 1830 (1967 Definition)'},
  helmert:   {epsg: 7020, name: 'Helmert 1906'},
  hough:     {epsg: 7053, name: 'Hough 1960'},
  engelis:   {epsg: 7054, name: 'Engelis 1985'}
};

// Proj4 prime meridian id -> WKT2 info + EPSG code + canonical longitude
var wkt2_pm_info = {
  greenwich: {epsg: 8901, name: 'Greenwich', longitude: 0},
  lisbon:    {epsg: 8902, name: 'Lisbon',    longitude: -9.0754862},
  paris:     {epsg: 8903, name: 'Paris',     longitude: 2.5969213},
  bogota:    {epsg: 8904, name: 'Bogota',    longitude: -74.08091666666667},
  madrid:    {epsg: 8905, name: 'Madrid',    longitude: -3.687938888888889},
  rome:      {epsg: 8906, name: 'Rome',      longitude: 12.45233333333333},
  bern:      {epsg: 8907, name: 'Bern',      longitude: 7.439583333333333},
  jakarta:   {epsg: 8908, name: 'Jakarta',   longitude: 106.8077194444444},
  ferro:     {epsg: 8909, name: 'Ferro',     longitude: -17.66666666666667},
  brussels:  {epsg: 8910, name: 'Brussels',  longitude: 4.367975},
  stockholm: {epsg: 8911, name: 'Stockholm', longitude: 18.05827777777778},
  athens:    {epsg: 8912, name: 'Athens',    longitude: 23.7163375},
  oslo:      {epsg: 8913, name: 'Oslo',      longitude: 10.72291666666667}
};

var WKT2_ANGLEUNIT = ['ANGLEUNIT', 'degree', 0.0174532925199433];
var WKT2_ANGLEUNIT_ARCSEC = ['ANGLEUNIT', 'arc-second', 4.84813681109536e-06];
var WKT2_LENGTHUNIT_M = ['LENGTHUNIT', 'metre', 1];
var WKT2_SCALEUNIT = ['SCALEUNIT', 'unity', 1];
var WKT2_SCALEUNIT_PPM = ['SCALEUNIT', 'parts per million', 1e-06];

// --- Top-level entry -------------------------------------------------------

function wkt2_make(P) {
  var core = pj_is_latlong(P) ? wkt2_make_geogcrs(P) : wkt2_make_projcrs(P);
  var towgs84 = wkt2_get_towgs84(P);
  if (towgs84) return wkt2_wrap_boundcrs(core, towgs84);
  return core;
}

function wkt2_get_towgs84(P) {
  var str = pj_param(P.params, 'stowgs84');
  if (!str) return null;
  var parts = String(str).split(',').map(function(s) { return parseFloat(s); });
  while (parts.length < 7) parts.push(0);
  // Only include if any non-zero
  if (!parts.some(function(v) { return v !== 0; })) return null;
  return parts;
}

function wkt2_wrap_boundcrs(source, towgs84) {
  var target = ['GEOGCRS', 'WGS 84',
    ['ENSEMBLE', 'World Geodetic System 1984 ensemble',
      ['MEMBER', 'World Geodetic System 1984'],
      ['ELLIPSOID', 'WGS 84', 6378137, 298.257223563, WKT2_LENGTHUNIT_M, ['ID', 'EPSG', 7030]],
      ['ENSEMBLEACCURACY', 2],
      ['ID', 'EPSG', 6326]],
    ['PRIMEM', 'Greenwich', 0, WKT2_ANGLEUNIT, ['ID', 'EPSG', 8901]],
    ['CS', 'ellipsoidal', 2],
    ['AXIS', 'geodetic latitude (Lat)', 'north', ['ORDER', 1], WKT2_ANGLEUNIT],
    ['AXIS', 'geodetic longitude (Lon)', 'east', ['ORDER', 2], WKT2_ANGLEUNIT],
    ['ID', 'EPSG', 4326]];
  var abridged = ['ABRIDGEDTRANSFORMATION', 'Transformation to WGS 84',
    ['METHOD', 'Position Vector transformation (geog2D domain)', ['ID', 'EPSG', 9606]],
    ['PARAMETER', 'X-axis translation', towgs84[0], WKT2_LENGTHUNIT_M, ['ID', 'EPSG', 8605]],
    ['PARAMETER', 'Y-axis translation', towgs84[1], WKT2_LENGTHUNIT_M, ['ID', 'EPSG', 8606]],
    ['PARAMETER', 'Z-axis translation', towgs84[2], WKT2_LENGTHUNIT_M, ['ID', 'EPSG', 8607]],
    ['PARAMETER', 'X-axis rotation', towgs84[3], WKT2_ANGLEUNIT_ARCSEC, ['ID', 'EPSG', 8608]],
    ['PARAMETER', 'Y-axis rotation', towgs84[4], WKT2_ANGLEUNIT_ARCSEC, ['ID', 'EPSG', 8609]],
    ['PARAMETER', 'Z-axis rotation', towgs84[5], WKT2_ANGLEUNIT_ARCSEC, ['ID', 'EPSG', 8610]],
    ['PARAMETER', 'Scale difference', towgs84[6], WKT2_SCALEUNIT_PPM, ['ID', 'EPSG', 8611]]];
  return ['BOUNDCRS',
    ['SOURCECRS', source],
    ['TARGETCRS', target],
    abridged];
}

// --- GEOGCRS / BASEGEOGCRS -------------------------------------------------

function wkt2_make_geogcrs(P) {
  return wkt2_make_geogcrs_node(P, 'GEOGCRS', true);
}

function wkt2_make_basegeogcrs(P) {
  return wkt2_make_geogcrs_node(P, 'BASEGEOGCRS', false);
}

function wkt2_make_geogcrs_node(P, keyword, includeCs) {
  var datumId = pj_param(P.params, 'sdatum');
  var emitter = datumId ? wkt2_datum_emitters[datumId] : null;
  var ellps = wkt2_make_ellipsoid(P);
  var pmLongitude = 0; // mapshaper-proj wkt_make_geogcs never sets a non-Greenwich PM
  var pmId = pj_param(P.params, 'spm');
  var pm = wkt2_make_primem(pmId);

  var name;
  if (emitter) {
    name = emitter.baseGeogCrsName;
  } else {
    name = wkt_get_geogcs_name(P);
    name = name.replace(/_/g, ' ');
  }

  var datumNode = wkt2_make_datum_node(P, emitter, ellps);
  var node = [keyword, name, datumNode, pm];

  if (includeCs) {
    node.push(['CS', 'ellipsoidal', 2]);
    node.push(['AXIS', 'geodetic latitude (Lat)', 'north', ['ORDER', 1], WKT2_ANGLEUNIT]);
    node.push(['AXIS', 'geodetic longitude (Lon)', 'east', ['ORDER', 2], WKT2_ANGLEUNIT]);
  }
  if (emitter && emitter.baseGeogCrsId) {
    node.push(['ID', 'EPSG', emitter.baseGeogCrsId]);
  }
  return node;
}

function wkt2_make_datum_node(P, emitter, ellipsoidNode) {
  if (emitter && emitter.ensemble) {
    // WKT2:2019 ENSEMBLE form (WGS 84 and a handful of others)
    var ens = ['ENSEMBLE', emitter.ensembleName];
    ens.push(['MEMBER', emitter.datumName]);
    ens.push(ellipsoidNode);
    ens.push(['ENSEMBLEACCURACY', 2]);
    if (emitter.ensembleId) {
      ens.push(['ID', 'EPSG', emitter.ensembleId]);
    }
    return ens;
  }
  var datumId = pj_param(P.params, 'sdatum');
  var datumName = emitter ? emitter.datumName :
    (datumId ? (find_datum(datumId) || {}).name || 'Unknown' : 'Unknown');
  datumName = datumName.replace(/_/g, ' ');
  var out = ['DATUM', datumName, ellipsoidNode];
  // Include TOWGS84 as a BOUNDCRS wrapper? Kept here as a non-standard
  // "extension" — skipped for spec compliance. A caller can wrap the
  // output in BOUNDCRS if they need datum transformations.
  return out;
}

function wkt2_make_ellipsoid(P) {
  var ellpsId = pj_param(P.params, 'sellps');
  if (!ellpsId) {
    var datumId = pj_param(P.params, 'sdatum');
    var defn = datumId ? find_datum(datumId) : null;
    ellpsId = defn ? defn.ellipse_id : '';
  }
  var info = ellpsId && wkt2_ellps_info[ellpsId];
  var name = info ? info.name :
    (find_ellps(ellpsId) ? find_ellps(ellpsId).name : 'Unknown');
  name = name.replace(/_/g, ' ');
  var a = P.a;
  var rf;
  if (pj_param(P.params, 'trf')) {
    rf = pj_param(P.params, 'drf');
  } else if (P.es) {
    rf = 1 / (1 - Math.sqrt(1 - P.es));
  } else {
    rf = 0;
  }
  var node = ['ELLIPSOID', name, a, rf, WKT2_LENGTHUNIT_M];
  if (info && info.epsg) {
    node.push(['ID', 'EPSG', info.epsg]);
  }
  return node;
}

function wkt2_make_primem(pmId) {
  var info = null;
  if (pmId) {
    if (wkt2_pm_info[pmId]) {
      info = wkt2_pm_info[pmId];
    } else {
      // Numeric longitude - reverse-match against the table to recover the
      // named PM where possible, otherwise emit "Reference meridian".
      var lon = parseFloat(pmId);
      if (isFinite(lon)) {
        Object.keys(wkt2_pm_info).forEach(function(k) {
          var v = wkt2_pm_info[k];
          if (!info && Math.abs(v.longitude - lon) < 1e-5) info = v;
        });
        if (!info) {
          info = {epsg: null, name: 'Reference meridian', longitude: lon};
        }
      }
    }
  }
  if (!info) info = wkt2_pm_info.greenwich;
  var node = ['PRIMEM', info.name, info.longitude, WKT2_ANGLEUNIT];
  if (info.epsg) node.push(['ID', 'EPSG', info.epsg]);
  return node;
}

// --- PROJCRS ---------------------------------------------------------------

function wkt2_make_projcrs(P) {
  // Handle projections WKT1 makers don't support, by building the WKT2
  // tree directly from the Proj4 parameters.
  var projId = pj_param(P.params, 'sproj');
  if (projId === 'somerc') return wkt2_make_somerc(P);
  if (projId === 'krovak') return wkt2_make_krovak(P);

  var projcs = wkt_make_projcs(P).PROJCS;
  var wkt1Name = projcs.PROJECTION;
  var def = wkt2_make_method_defs[wkt1Name];
  if (!def) {
    wkt_error('wkt2_from_proj4: unsupported WKT1 projection: ' + wkt1Name);
  }

  var base = wkt2_make_basegeogcrs(P);
  var unit = wkt2_make_projcs_lengthunit(projcs.UNIT);
  var conv = wkt2_make_conversion(def, projcs.PARAMETER, unit);
  var name = projcs.NAME ? projcs.NAME.replace(/_/g, ' ') : 'unknown';

  var node = ['PROJCRS', name, base, conv];
  node.push(['CS', 'Cartesian', 2]);
  node.push(['AXIS', '(E)', 'east', ['ORDER', 1], unit]);
  node.push(['AXIS', '(N)', 'north', ['ORDER', 2], unit]);
  return node;
}

function wkt2_make_direct_projcrs(P, name, conv) {
  var base = wkt2_make_basegeogcrs(P);
  var unit = WKT2_LENGTHUNIT_M;
  var node = ['PROJCRS', name, base, conv,
    ['CS', 'Cartesian', 2],
    ['AXIS', '(E)', 'east', ['ORDER', 1], unit],
    ['AXIS', '(N)', 'north', ['ORDER', 2], unit]];
  return node;
}

function wkt2_make_somerc(P) {
  // Swiss Oblique Mercator -> EPSG 9815 Hotine Oblique Mercator (variant B)
  var lat0 = pj_param(P.params, 'dlat_0') || 0;
  var lon0 = pj_param(P.params, 'dlon_0') || 0;
  var k = pj_param(P.params, 'dk_0') || pj_param(P.params, 'dk') || 1;
  var x0 = pj_param(P.params, 'dx_0') || 0;
  var y0 = pj_param(P.params, 'dy_0') || 0;
  var conv = ['CONVERSION', 'Swiss Oblique Mercator',
    ['METHOD', 'Hotine Oblique Mercator (variant B)', ['ID', 'EPSG', 9815]],
    ['PARAMETER', 'Latitude of projection centre', lat0, WKT2_ANGLEUNIT, ['ID', 'EPSG', 8811]],
    ['PARAMETER', 'Longitude of projection centre', lon0, WKT2_ANGLEUNIT, ['ID', 'EPSG', 8812]],
    ['PARAMETER', 'Azimuth of initial line', 90, WKT2_ANGLEUNIT, ['ID', 'EPSG', 8813]],
    ['PARAMETER', 'Angle from Rectified to Skew Grid', 90, WKT2_ANGLEUNIT, ['ID', 'EPSG', 8814]],
    ['PARAMETER', 'Scale factor on initial line', k, WKT2_SCALEUNIT, ['ID', 'EPSG', 8815]],
    ['PARAMETER', 'Easting at projection centre', x0, WKT2_LENGTHUNIT_M, ['ID', 'EPSG', 8816]],
    ['PARAMETER', 'Northing at projection centre', y0, WKT2_LENGTHUNIT_M, ['ID', 'EPSG', 8817]]];
  return wkt2_make_direct_projcrs(P, 'Swiss Oblique Mercator', conv);
}

function wkt2_make_krovak(P) {
  var lat0 = pj_param(P.params, 'dlat_0') || 49.5;
  var lon0 = pj_param(P.params, 'dlon_0') || 24.8333333333333;
  var alpha = pj_param(P.params, 'dalpha') || 30.2881397527778;
  var sp = pj_param(P.params, 'dlat_ts') || 78.5;
  var k = pj_param(P.params, 'dk_0') || pj_param(P.params, 'dk') || 1;
  var x0 = pj_param(P.params, 'dx_0') || 0;
  var y0 = pj_param(P.params, 'dy_0') || 0;
  var conv = ['CONVERSION', 'Krovak',
    ['METHOD', 'Krovak (North Orientated)', ['ID', 'EPSG', 1041]],
    ['PARAMETER', 'Latitude of projection centre', lat0, WKT2_ANGLEUNIT, ['ID', 'EPSG', 8811]],
    ['PARAMETER', 'Longitude of origin', lon0, WKT2_ANGLEUNIT, ['ID', 'EPSG', 8833]],
    ['PARAMETER', 'Co-latitude of cone axis', alpha, WKT2_ANGLEUNIT, ['ID', 'EPSG', 1036]],
    ['PARAMETER', 'Latitude of pseudo standard parallel', sp, WKT2_ANGLEUNIT, ['ID', 'EPSG', 8818]],
    ['PARAMETER', 'Scale factor on pseudo standard parallel', k, WKT2_SCALEUNIT, ['ID', 'EPSG', 8819]],
    ['PARAMETER', 'False easting', x0, WKT2_LENGTHUNIT_M, ['ID', 'EPSG', 8806]],
    ['PARAMETER', 'False northing', y0, WKT2_LENGTHUNIT_M, ['ID', 'EPSG', 8807]]];
  return wkt2_make_direct_projcrs(P, 'Krovak', conv);
}

function wkt2_make_projcs_lengthunit(unitArr) {
  if (!unitArr) return WKT2_LENGTHUNIT_M;
  var name = String(unitArr[0] || 'metre');
  var factor = unitArr[1] == null ? 1 : unitArr[1];
  // Normalise WKT1's "Meter" -> WKT2 "metre"
  if (/^meter$/i.test(name)) name = 'metre';
  return ['LENGTHUNIT', name, factor];
}

function wkt2_make_conversion(def, wkt1Params, projUnit) {
  var conv = ['CONVERSION', def.name];
  var method = ['METHOD', def.name];
  if (def.epsg) method.push(['ID', 'EPSG', def.epsg]);
  conv.push(method);
  def.params.forEach(function(key) {
    var pd = wkt2_make_param_defs[key];
    if (!pd) wkt_error('wkt2_make: missing param def for ' + key);
    var value = wkt2_find_wkt1_param(wkt1Params, pd);
    if (value == null) {
      if (pd.skipIfAbsent) return;
      value = pd.default;
    }
    var unitNode;
    if (pd.unit === 'angle') unitNode = WKT2_ANGLEUNIT;
    else if (pd.unit === 'length') unitNode = projUnit;
    else unitNode = WKT2_SCALEUNIT;
    var param = ['PARAMETER', pd.wkt2, value, unitNode];
    if (pd.epsg) param.push(['ID', 'EPSG', pd.epsg]);
    conv.push(param);
  });
  return conv;
}

function wkt2_find_wkt1_param(params, pd) {
  if (!params) return null;
  for (var i = 0; i < params.length; i++) {
    if (params[i][0] === pd.wkt1) return params[i][1];
    if (pd.wkt1_fallback && params[i][0] === pd.wkt1_fallback) return params[i][1];
  }
  return null;
}
