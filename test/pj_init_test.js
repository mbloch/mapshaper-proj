var assert = require('assert'),
    helpers = require('./helpers.js'),
    api = require('../');

describe('pj_init.js', function () {

  describe('+init= tests', function () {
    // reference data was generated using:
    // cs2cs -f %.14f +proj=longlat +datum=WGS84 +to <proj4 string>

    function test(projStr, lp, xy, tol) {
      it(projStr, function() {
        var output = api(api.WGS84, projStr, lp);
        tol = tol || 1e-7;
        helpers.closeToPoint(output, xy, tol);
      })
    }

    // webmercator (defn contains +nadgrids=@null)
    test('+init=epsg:3785', [10, 10, 0],
      [1113194.90793273434974, 1118889.97485795826651, 0]);

    // NAD83 / Idaho Central (ftUS)
    test('+init=epsg:2242', [-90, 45, 0],
      [7843758.87995513156056, 2161449.59161074040458, 0]);
    // Ain el Abd / Aramco Lambert
    test('+init=epsg:2318', [40, 45, 0],
      [-666427.66579883545637, 2254673.09066507359967, -25.61474410723895]);
    // ED50 / TM27
    test('+init=epsg:2319', [20, 45, 0],
      [-51882.06449849705677, 5009028.38139596953988, -38.32251742761582]);
    // TWD97 (geocent)
    test('+init=epsg:3822', [20, 45, 0],
      [4245146.81261895131320, 1545107.07988334191032, 4487348.40875480137765]);
  })


  describe('pj_get_params()', function () {

    function test(str, obj) {
      var params = Object.keys(obj).reduce(function(memo, key) {
        memo[key] = {used: false, param: obj[key]};
        return memo;
      }, {});
      it(str, function() {
        var params2 = api.internal.pj_get_params(str);
        assert.deepEqual(params2, params);
      });
    }

    test('+proj=merc', {proj: "merc"});
    test('+proj=tmerc +lat_0=21.16666666666667 +lon_0=-158 +k=0.99999 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs',
      {proj: "tmerc", lat_0: "21.16666666666667", lon_0: "-158", k: "0.99999",
      x_0: "500000", y_0: "0", ellps: "GRS80", units: "m", no_defs: true});
  })
})
