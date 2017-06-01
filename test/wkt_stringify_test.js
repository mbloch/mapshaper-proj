var assert = require('assert'),
    api = require('../'),
    fs = require('fs');

describe('wkt_stringify.js', function(){
  var files = [
    'british_national_grid_esri.prj',
    'british_national_grid_ogc.prj',
    'web_mercator_aux_sphere_esri.prj',
    'web_mercator_v2_esri.prj',
    'web_mercator_v3_esri.prj',
    'web_mercator_v4.prj',
    'ups_south_ogc.prj',
    'omerc_michigan_v2_ogc.prj',
    'utm_18N_esri.prj',
    'utm_18N_ogc.prj',
    'wgs84_esri.prj',
    'wgs84_ogc.prj',
    'wgs84_ogc.prj',
    'british_national_grid_ogc.prj', // has AXIS
    'etrs89_austria_ogc.prj' // has AXIS
  ];
  files.forEach(function(file) {
      roundtrip('test/prj/' + file);
  });
});

function roundtrip(file) {
  it(file, function() {
    var wkt = fs.readFileSync(file, 'utf8');
    var wkt_obj = api.internal.wkt_parse(wkt);
    var wkt2 = api.internal.wkt_stringify(wkt_obj);
    var wkt2_obj = api.internal.wkt_parse(wkt2);
    // compare parsed objects, because integer values in original wkt strings may
    //   or may not have ".0" appended
    assert.deepEqual(wkt2_obj, wkt_obj);
  })
}
