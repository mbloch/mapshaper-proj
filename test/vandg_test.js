var assert = require('assert'),
    api = require('../'),
    helpers = require('./helpers');

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

    var s_fwd_expect = [
    [ 223395.24954340671,  111704.59663367498],
    [ 223395.24954340671, -111704.59663367498],
    [-223395.24954340671,  111704.59663367498],
    [-223395.24954340671, -111704.59663367498]
    ];

    var s_inv_expect = [
    [ 0.001790493715929761,  0.00089524655486993867],
    [ 0.001790493715929761, -0.00089524655486993867],
    [-0.001790493715929761,  0.00089524655486993867],
    [-0.001790493715929761, -0.00089524655486993867]
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
