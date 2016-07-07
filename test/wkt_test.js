var assert = require('assert'),
    mproj = require('../'),
    helpers = require('./helpers.js'),
    wkt_to_proj4 = mproj.internal.wkt_to_proj4,
    fs = require('fs');

// reference data points were generated with ogr2ogr (gdal v1.11.3_1)
// using params: -s_srs EPSG:4326 -t_srs <prj file>
// with some ESRI prj files, ogr2ogr needs to use -t_srs ESRI::<prj file>

// failed data points:

// ['nsper_world_esri.prj', [1, 2], []],
// unable to generate reference output with ogr2ogr
// (ERROR 6: No translation for Vertical_Near_Side_Perspective to PROJ.4 format is known.)
// see https://trac.osgeo.org/gdal/ticket/3404
// see https://trac.osgeo.org/gdal/ticket/2641

// ['lcc_1sp_esri.prj', [-172, -15], [-205317.11617721518, 41182.49849648412]],
// source: http://spatialreference.org/ref/epsg/3102/
// ESRI version on spatialreference.org is missing towgs84 parameter; ogr version passes

// web mercator ... DONE
// see https://trac.osgeo.org/gdal/ticket/3962

// TODO
// omerc (apparently Hotine variations can cause problems)
// see https://trac.osgeo.org/gdal/ticket/2745
// see https://github.com/proj4js/proj4js/issues/153

// british national grid
// http://spatialreference.org/ref/epsg/27700/


var data = [
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
  ['british_national_grid_esri.prj', [-1, 50], [471764.56177428545, 11571.317991569958]],
  ['british_national_grid_ogc.prj', [-1, 50], [471764.56177428545, 11571.317991569958]],
  ['equirectangular_sphere_esri.prj', [1, 40], [55597.46332227937, 4447797.06578235]],
  ['equirectangular_sphere_ogc.prj', [1, 40], [55597.46332227937, 4447797.06578235]],
  ['web_mercator_v3_esri.prj', [1, 40], [111319.4907932736, 4865942.279503176]],
  ['web_mercator_v2_esri.prj', [1, 40], [111319.4907932736, 4865942.279503176]],
  ['web_mercator_v3_ogc.prj', [1, 40], [111319.4907932736, 4865942.279503176]],
  ['web_mercator_v2_ogc.prj', [1, 40], [111319.4907932736, 4865942.279503176]],
  ['web_mercator_aux_sphere_esri.prj', [1, 40], [111319.49079327231, 4865942.279503176]],
  ['web_mercator_esri.prj', [1, 40], [111319.4907932736, 4865942.279503176]],
  ['prince_edward_island_stereographic_esri.prj', [-64, 44], [619737.6344871046, 39218.2494574468]],
  ['prince_edward_island_stereographic_ogc.prj', [-64, 44], [619737.6344871046, 39218.2494574468]],
  ['ups_south_esri.prj', [88, -88], [2221933.9903302956, 2007750.105718708]],
  ['ups_south_ogc.prj', [88, -88], [2221933.9903302956, 2007750.105718708]],
  ['utm_18N_ogc.prj', [-76, 2], [388786.69872876577, 221094.86683849935]],
  ['utm_18N_esri.prj', [-76, 2], [388786.69872876577, 221094.86683849935]],
  ['stateplane_ny_li_nad83_feet_esri.prj', [-75, 41], [708222.941382124, 305182.4263439535]],
  ['stateplane_ny_li_nad83_feet_ogc.prj', [-75, 41], [708222.941382124, 305182.4263439535]],
  ['lcc_1sp_ogc.prj', [-172, -15], [-205317.11617721518, 41182.49849648412]],
  ['robinson_world_esri.prj', [1, 2], [94452.16280596999, 213903.8360054024]],
  ['robinson_sphere_esri.prj', [1, 2], [94346.47283945685, 213664.4821505745]],
  ['wgs84_esri.prj', [1, 2], [1, 2]],
  ['wgs84_ogc.prj', [1, 2], [1, 2]]
];

describe('wkt parsing + mproj transform', function() {
  data.forEach(function(arr) {
    var file = arr[0],
        lp = arr[1],
        xy = arr[2];
    it('[fwd] ' + file, function() {
      var wkt = fs.readFileSync('test/prj/' + file, 'utf8');
      var proj4 = wkt_to_proj4(wkt);
      var output = mproj(proj4, lp);
      helpers.closeToPoint(output, xy, 1e-4);
    })
    it('[inv] ' + file, function() {
      var wkt = fs.readFileSync('test/prj/' + file, 'utf8');
      var proj4 = wkt_to_proj4(wkt);
      var output = mproj(proj4, mproj.WGS84, xy);
      helpers.closeToPoint(output, lp, 1e-4);
    })
  })
})
