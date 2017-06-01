var assert = require('assert'),
    proj = require('../');

describe('wkt_projcs.js', function () {
  describe('PROJCS name', function () {

    function test(proj4, expect) {
      it(expect, function() {
        var P = proj.pj_init(proj4);
        var o = proj.internal.wkt_make_projcs(P);
        assert.equal(o.PROJCS.NAME, expect);
      });
    }

    test('+init=epsg:2287', 'NAD83 / Wisconsin North (ftUS)');
    test('+proj=utm +zone=18 +datum=WGS84 +no_defs', 'WGS84 / UTM zone 18N');
    test('+proj=utm +zone=1 +datum=WGS84 +south +no_defs', 'WGS84 / UTM zone 1S'); // should it be 01S?
    test('+proj=robin +datum=WGS84 +no_defs', 'WGS84 / Robinson');
    test('+proj=ups +datum=WGS84 +south +no_defs', 'WGS84 / UPS South'); // should it be 01S
  })

})
