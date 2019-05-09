var assert = require('assert'),
    api = require('../'),
    wkt_from_proj4 = api.internal.wkt_from_proj4;

describe('wkt_from_proj() (in wkt.js)', function () {
  describe('stere', function () {
    // issue #339: error converting +proj=stere
    it('+proj=stere', function() {
      var wkt = wkt_from_proj4('+proj=stere');
      var expected = 'PROJCS["UNK / Stereographic",GEOGCS["UNK",DATUM["Unknown datum",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.017453292519943295]],PROJECTION["Stereographic"],UNIT["Meter",1]]';
      assert.equal(wkt, expected);
    });
  });
});
