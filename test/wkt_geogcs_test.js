var assert = require('assert'),
    proj = require('../');

describe('wkt_geogcs.js', function () {
  describe('wkt_get_geogcs_name()', function () {

    function test(proj4, expect) {
      it(expect, function() {
        var P = proj.pj_init(proj4);
        var name = proj.internal.wkt_get_geogcs_name(P);
        assert.equal(name, expect);
      });
    }

    test('+proj=longlat +datum=NAD83', 'NAD83');
    test('+proj=longlat +datum=WGS84', 'WGS84');
    test('+proj=longlat +datum=potsdam', 'Potsdam');
    test('+init=epsg:4001', 'Unknown datum based upon the Airy 1830 ellipsoid');
    test('+init=epsg:4149', 'CH1903');
    test('+init=esri:4023', 'GCS International 1967');

  })
})
