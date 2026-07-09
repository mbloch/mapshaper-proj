var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('aitoff.js', function () {
  var fwd_in = [
    [ 2, 1],
    [ 2,-1],
    [-2, 1],
    [-2,-1]
  ];

  var inv_in = [
    [ 200, 100],
    [ 200,-100],
    [-200, 100],
    [-200,-100]
  ];

  describe('Aitoff', function() {
    var s_fwd_expect = [
        [223379.45881169615,  111706.74288385305],
        [223379.45881169615,  -111706.74288385305],
        [-223379.45881169615,  111706.74288385305],
        [-223379.45881169615,  -111706.74288385305]
    ];

    var s_inv_expect = [
        [0.0017904931100388164,  0.00089524655491012516],
        [0.0017904931100388164,  -0.00089524655491012516],
        [-0.0017904931100388164,  0.00089524655491012516],
        [-0.0017904931100388164,  -0.00089524655491012516]
    ];

    var sargs = "+proj=aitoff   +a=6400000    +lat_1=0.5 +lat_2=2";

    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
    // helpers.inv_test(sargs, inv_in, s_inv_expect);

    it('handles a singular inverse starting point', function() {
      var P = api.pj_init(sargs);
      var xy = {x: 2 * Math.PI * 6400000, y: 0};
      var lp = api.pj_inv(xy, P);
      assert.equal(lp.lam, Infinity);
      assert.equal(lp.phi, Infinity);
    });

  })

  describe('Winkel Tripel', function () {

    var s_fwd_expect = [
        [223390.80153348515,  111703.90750574505],
        [223390.80153348515,  -111703.90750574505],
        [-223390.80153348515,  111703.90750574505],
        [-223390.80153348515,  -111703.90750574505]
    ];

    var s_inv_expect = [
        [0.0017904931099113196,  0.00089524655490101819],
        [0.0017904931099113196,  -0.00089524655490101819],
        [-0.0017904931099113196,  0.00089524655490101819],
        [-0.0017904931099113196,  -0.00089524655490101819]
    ];
    var sargs = "+proj=wintri   +a=6400000    +lat_1=0 +lat_2=2";

    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
    // helpers.inv_test(sargs, inv_in, s_inv_expect);
  })
});
