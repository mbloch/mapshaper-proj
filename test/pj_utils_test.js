var assert = require('assert'),
    helpers = require('./helpers.js'),
    api = require('../');

describe('pj_utils.js', function () {

  describe('get_proj_defn()', function () {

    // test initialization from Proj.4 string and conversion back to Proj.4 string
    function test(src, dest) {
      it (src + ' -> ' + dest, function() {
        var P = api.pj_init(src);
        assert.equal(api.internal.get_proj_defn(P), dest);
      })

      if (src != dest) {
        // dest defn should convert to itself
        it (dest + ' -> ' + dest, function() {
          var P = api.pj_init(dest);
          assert.equal(api.internal.get_proj_defn(P), dest);
        })
      }
    }
    test('+proj=utm +zone=18 +datum=NAD83', '+proj=utm +zone=18 +datum=NAD83');
    test('+proj=robin +a=6371000 +no_defs', '+proj=robin +a=6371000 +es=0');
    test('+proj=robin +a=6371000 +b=6371000', '+proj=robin +a=6371000 +b=6371000');
    test('+init=epsg:4326', '+proj=longlat +datum=WGS84');
    test('+init=epsg:5070', '+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 +y_0=0 +units=m +datum=NAD83');
    test('+init=epsg:3991', '+proj=lcc +lat_1=18.43333333333333 +lat_2=18.03333333333333 +lat_0=17.83333333333333 +lon_0=-66.43333333333334 +x_0=152400.3048006096 +y_0=0 +units=us-ft +ellps=clrk66 +towgs84=11,72,-101,0,0,0,0');
  })
});
