var assert = require('assert'),
    wkt_to_proj4 = require('../').internal.wkt_to_proj4,
    fs = require('fs');


var files = [
  ['nsper_world_esri.prj', '+proj=nsper +h=35800000 +datum=WGS84 +no_defs'],
  ['utm_18N_esri.prj', '+proj=utm +zone=18 +datum=WGS84 +no_defs'],
  ['stateplane_ny_li_nad83_feet_esri.prj', '+proj=lcc +x_0=300000 +lon_0=-74 +lat_1=40.66666666666666 +lat_2=41.03333333333333 +lat_0=40.16666666666666 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs'],
  ['robinson_world_esri.prj', '+proj=robin +datum=WGS84 +no_defs'],
  ['robinson_sphere_esri.prj', '+proj=robin +a=6371000 +no_defs'],
  ['wgs84_esri.prj', '+proj=longlat +datum=WGS84'],
  ['wgs84_ogc.prj', '+proj=longlat +datum=WGS84'],
  ['web_mercator_esri.prj', '+proj=merc +a=6378137 +no_defs'],
  ['web_mercator_aux_sphere_esri.prj', '+proj=merc +a=6378137 +no_defs'],
  ['web_mercator_v2_esri.prj', '+proj=merc +a=6378137 +no_defs'],
  ['web_mercator_v2_ogc.prj', '+proj=merc +a=6378137 +no_defs'],
  ['web_mercator_v3_esri.prj', '+proj=merc +a=6378137 +no_defs'],
  ['web_mercator_v3_ogc.prj', '+proj=merc +a=6378137 +no_defs'],
  ['web_mercator_v4.prj', '+proj=merc +a=6378137 +no_defs']

];

// files = [files[0]];

describe('wkt_to_proj4.js', function() {
  files.forEach(function(arr) {
    var file = arr[0],
        expect = arr[1];
    it(file, function() {
      var wkt = fs.readFileSync('test/prj/' + file, 'utf8');
      var output = wkt_to_proj4(wkt);
      if (output != expect) {
        // console.log(output); console.log(); console.log(expect);
      }
      assert.equal(output, expect);
    })
  })
})
