var assert = require('assert'),
    mproj = require('../'),
    helpers = require('./helpers.js'),
    wkt_to_proj4 = mproj.internal.wkt_to_proj4,
    fs = require('fs');

// Reference data points were (mostly) generated using ogr2ogr (gdal v1.11.3_1)
// using params: -s_srs EPSG:4326 -t_srs <prj file>.
// With some ESRI prj files, ogr2ogr needed to use -t_srs ESRI::<prj file>.

// failed data points:

// ['nsper_world_esri.prj', [1, 2], []],
// unable to generate reference output with ogr2ogr
// (ERROR 6: No translation for Vertical_Near_Side_Perspective to PROJ.4 format is known.)
// see https://trac.osgeo.org/gdal/ticket/3404
// see https://trac.osgeo.org/gdal/ticket/2641

// ['lcc_1sp_esri.prj', [-172, -15], [-205317.11617721518, 41182.49849648412]],
// source: http://spatialreference.org/ref/epsg/3102/
// ESRI version on spatialreference.org is missing towgs84 parameter; ogr version passes
//
// Projection notes:
//
// web mercator
// see https://trac.osgeo.org/gdal/ticket/3962
//
// omerc
// see:
//   https://trac.osgeo.org/gdal/ticket/2745
//   http://www.remotesensing.org/geotiff/proj_list/hotine_oblique_mercator.html/
//   http://webhelp.esri.com/arcgisdesktop/9.3/index.cfm?TopicName=Hotine_Oblique_Mercator
//   https://github.com/proj4js/proj4js/issues/153
//   ** https://github.com/OSGeo/proj.4/issues/104
//   ** https://trac.osgeo.org/gdal/ticket/2745
//   http://www.iogp.org/pubs/373-07-2.pdf
//
// http://spatialreference.org/ref/epsg/3078/
//   omerc_michigan_esri.prj
//   Hotine_Oblique_Mercator_Azimuth_Natural_Origin / rectified_grid_angle
//   +proj=omerc +lat_0=45.30916666666666 +lonc=-86 +alpha=337.25556 +k=0.9996 +x_0=2546731.496 +y_0=-4354009.816 +ellps=GRS80 +datum=NAD83 +units=m +no_defs
//
// http://spatialreference.org/ref/epsg/26931/
//   omerc_alaska_esri.prj
//   Hotine_Oblique_Mercator_Azimuth_Natural_Origin
//
// http://spatialreference.org/ref/esri/54025/
//   omerc_world_esri.prj
//   Hotine_Oblique_Mercator_Two_Point_Natural_Origin
//   The original ESRI World Hotine .prj fails because lat_1 == 0; I changed lat_1 for this test
//
// http://spatialreference.org/ref/epsg/29701/
//  Laborde
//  http://www.remotesensing.org/geotiff/proj_list/laborde_oblique_mercator.html
//

var data = [
  ['albers_australia_ogc.prj', [100, 5], [-3954044.7637846502, 2318.607577734529]],
  ['albers_australia_esri.prj', [100, 5], [-3954044.7637846502, 2318.607577734529]],
  ['omerc_kertau_esri.prj', [100, 5], [-26896.88540470556, 27531.305812492505]],
  ['omerc_kertau_ogc.prj', [100, 5], [-26896.88540470556, 27531.305812492505]],
  // omerc_world_*, based on ESRI "World Hotine", could not be generated
  // with ogr2ogr; used cs2cs instead
  ['omerc_world_ogc.prj', [-130, 55], [-893729.49277305440046, 11156293.61587933637202]],
  ['omerc_world_esri.prj', [-130, 55], [-893729.49277305440046, 11156293.61587933637202]],
  ['omerc_alaska_ogc.prj', [-130, 55], [3455449.120106008, 1176720.5148126674]],
  ['omerc_alaska_esri.prj', [-130, 55], [3455449.120106008, 1176720.5148126674]],
  ['omerc_michigan_esri.prj', [-85, 47], [575865.25506942928769, 716967.10020850971341]],
  ['omerc_michigan_ogc.prj', [-85, 47], [575865.25506942928769, 716967.10020850971341]],
  // using lower precision for inverse conversion (the imprecision is present in Proj.4)
  ['vandg_world_esri.prj', [-90, 45], [-9360276.075469567, 5654149.842884019],, 1e-3],
  ['vandg_world_ogc.prj', [-90, 45], [-9360276.075469567, 5654149.842884019],, 1e-3],
  ['laea_ogc.prj', [-90, 45], [783770.551150511, 48487.045984816374]],
  ['laea_esri.prj', [-90, 45], [783770.551150511, 48487.045984816374]],
  ['mercator_1sp_esri.prj', [111, 12], [4010972.658327883, 2232691.567371556]],
  // ogr2ogr gave slightly different output for mercator_1sp_ogc.prj; cs2cs gave this output (why?)
  ['mercator_1sp_ogc.prj', [111, 12], [4010972.658327883, 2232691.567371556]],
  ['plate_carree_sphere_esri.prj', [-60, 12], [-6671695.598673525, 1334339.1197347052]],
  ['plate_carree_sphere_ogc.prj', [-60, 12], [-6671695.598673525, 1334339.1197347052]],
  ['cassini_ogc.prj', [-60, 12], [558884.9181788838, 591657.0256998448]],
  ['cassini_esri.prj', [-60, 12], [558884.9181788838, 591657.0256998448]],
  ['azimuthal_equidistant_esri.prj', [-125, 56], [-3107373.5903223804, 2175806.4119775034]],
  ['azimuthal_equidistant_ogc.prj', [-125, 56], [-3107373.5903223804, 2175806.4119775034]],
  ['bc_albers_esri.prj', [-125, 56], [1062242.5254453921, 1223288.3193571875]],
  ['mollweide_world_esri.prj', [50, 48], [3900693.4468074273, 5662449.7203778215]],
  ['mollweide_world_ogc.prj', [50, 48], [3900693.4468074273, 5662449.7203778215]],
  ['etrs89_austria_esri.prj', [50, 48], [3035037.6274828496, 1089081.8935549718]],
  ['etrs89_austria_ogc.prj', [50, 48], [3035037.6274828496, 1089081.8935549718]],
  ['world_sinusoidal_esri.prj', [100, 35], [9128816.964617956, 3874592.9016950703]],
  ['world_sinusoidal_ogc.prj', [100, 35], [9128816.964617956, 3874592.9016950703]],
  ['equidistant_conic_esri.prj', [100, 35], [417087.1137573342, 565820.5682668928]],
  ['equidistant_conic_ogc.prj', [100, 35], [417087.1137573342, 565820.5682668928]],
  // http://spatialreference.org/ref/epsg/27700/
  ['british_national_grid_esri.prj', [-1, 50], [471764.56177428545, 11571.317991569958]],
  ['british_national_grid_ogc.prj', [-1, 50], [471764.56177428545, 11571.317991569958]],
  ['equirectangular_sphere_esri.prj', [1, 40], [55597.46332227937, 4447797.06578235]],
  ['equirectangular_sphere_ogc.prj', [1, 40], [55597.46332227937, 4447797.06578235]],
  ['web_mercator_v3_esri.prj', [1, 40], [111319.4907932736, 4865942.279503176]],
  ['web_mercator_v3_ogc.prj', [1, 40], [111319.4907932736, 4865942.279503176]],
  ['web_mercator_v2_esri.prj', [1, 40], [111319.4907932736, 4865942.279503176]],
  ['web_mercator_v2_ogc.prj', [1, 40], [111319.4907932736, 4865942.279503176]],
  ['web_mercator_aux_sphere_esri.prj', [1, 40], [111319.49079327231, 4865942.279503176]],
  ['web_mercator_esri.prj', [1, 40], [111319.4907932736, 4865942.279503176]],
  ['prince_edward_island_stereographic_esri.prj', [-64, 44], [619737.6344871046, 39218.2494574468]],
  ['prince_edward_island_stereographic_ogc.prj', [-64, 44], [619737.6344871046, 39218.2494574468]],
  ['ups_south_esri.prj', [88, -88], [2221933.9903302956, 2007750.105718708]],
  ['ups_south_ogc.prj', [88, -88], [2221933.9903302956, 2007750.105718708]],
  ['utm_18N_ogc.prj', [-76, 2], [388786.69872876577, 221094.86683849935]],
  ['utm_18N_esri.prj', [-76, 2], [388786.69872876577, 221094.86683849935]],
  ['utm_18N_csrs98_ogc.prj', [-76, 2], [388786.6987287634, 221094.86683121312]],
  ['utm_18N_csrs98_esri.prj', [-76, 2], [388786.6987287634, 221094.86683121312]],
  ['stateplane_ny_li_nad83_feet_esri.prj', [-75, 41], [708222.941382124, 305182.4263439535]],
  ['stateplane_ny_li_nad83_feet_ogc.prj', [-75, 41], [708222.941382124, 305182.4263439535]],
  ['lcc_1sp_ogc.prj', [-172, -15], [-205317.11617721518, 41182.49849648412]],
  ['robinson_world_esri.prj', [1, 2], [94452.16280596999, 213903.8360054024]],
  ['robinson_sphere_esri.prj', [1, 2], [94346.47283945685, 213664.4821505745]],
  ['wgs84_esri.prj', [1, 2], [1, 2]],
  ['wgs84_ogc.prj', [1, 2], [1, 2]]
];

// data = [data[0]]

describe('wkt parsing + mproj transform', function() {
  data.forEach(function(arr) {
    var file = arr[0],
        lp = arr[1],
        xy = arr[2];
    it('[fwd] ' + file, function() {
      var tol = arr[3] || 1e-7;
      var wkt = fs.readFileSync('test/prj/' + file, 'utf8');
      var proj4 = wkt_to_proj4(wkt);
      // console.log(proj4)
      var output = mproj(proj4, lp);
      helpers.closeToPoint(output, xy, tol);
    })
    it('[inv] ' + file, function() {
      var tol = arr[4] || 1e-6;
      var wkt = fs.readFileSync('test/prj/' + file, 'utf8');
      var proj4 = wkt_to_proj4(wkt);
      var output = mproj(proj4, mproj.WGS84, xy);
      helpers.closeToPoint(output, lp, tol);
    })
  })
})
