var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('vandg.js', function () {

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

  describe('van der Grinten (I)', function () {

    // from a 50-digit computation; the previous y was 0.12 mm off
    var s_fwd_expect = [
    [ 223395.24954342114,  111704.59651696655],
    [ 223395.24954342114, -111704.59651696655],
    [-223395.24954342114,  111704.59651696655],
    [-223395.24954342114, -111704.59651696655]
    ];

    // from a 50-digit computation; the previous longitude was 6e-10 deg off
    var s_inv_expect = [
    [ 0.0017904931098281133,  0.00089524655486976545],
    [ 0.0017904931098281133, -0.00089524655486976545],
    [-0.0017904931098281133,  0.00089524655486976545],
    [-0.0017904931098281133, -0.00089524655486976545]
    ];

    var sargs = "+proj=vandg   +a=6400000    +lat_1=0.5 +lat_2=2";

    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
    helpers.inv_test(sargs, inv_in, s_inv_expect);

  })

  describe('van der Grinten II', function () {

    var s_fwd_expect = [
    [ 223395.24785043663,  111718.49103722633],
    [ 223395.24785043663, -111718.49103722633],
    [-223395.24785043663,  111718.49103722633],
    [-223395.24785043663, -111718.49103722633]
    ];

    var sargs = "+proj=vandg2   +a=6400000    +lat_1=0.5 +lat_2=2";

    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  })

  describe('van der Grinten III', function () {

    var s_fwd_expect = [
    [ 223395.24955283134,  111704.51990442065],
    [ 223395.24955283134, -111704.51990442065],
    [-223395.24955283134,  111704.51990442065],
    [-223395.24955283134, -111704.51990442065]
    ];

    var sargs = "+proj=vandg3   +a=6400000    +lat_1=0.5 +lat_2=2";

    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  })

  describe('van der Grinten IV', function () {

    var s_fwd_expect = [
    [ 223374.57729435508,  111701.19548415358],
    [ 223374.57729435508, -111701.19548415358],
    [-223374.57729435508,  111701.19548415358],
    [-223374.57729435508, -111701.19548415358]
    ];

    var sargs = "+proj=vandg4   +a=6400000    +lat_1=0.5 +lat_2=2";

    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  })

});
