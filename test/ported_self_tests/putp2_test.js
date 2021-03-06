var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('putp2.js', function () {

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
  describe('Putnins P2', function () {

    var s_fwd_expect = [
       [ 211638.039634339279,  117895.033043379764],
       [ 211638.039634339279, -117895.033043379764],
       [-211638.039634339279,  117895.033043379764],
       [-211638.039634339279, -117895.033043379764]
    ];
    var s_inv_expect = [
       [ 0.00188980221640386672,  0.000848201580276863377],
       [ 0.00188980221640386672, -0.000848201580276863377],
       [-0.00188980221640386672,  0.000848201580276863377],
       [-0.00188980221640386672, -0.000848201580276863377]
    ];
    var sargs = "+proj=putp2   +a=6400000    +lat_1=0 +lat_2=2";
    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
    helpers.inv_test(sargs, inv_in, s_inv_expect);
  })

});
