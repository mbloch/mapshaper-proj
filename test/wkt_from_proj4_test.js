var assert = require('assert'),
    proj = require('../'),
    wkt_from_proj4 = proj.internal.wkt_from_proj4,
    fs = require('fs');

describe('wkt_from_proj4.js', function() {
  describe('wkt_from_proj4()', function () {

    function test(proj4) {
      it(proj4, function() {
        var P = proj.pj_init(proj4);
        var wkt = wkt_from_proj4(P);
        // console.log(wkt);
      });
    }

  })


});
