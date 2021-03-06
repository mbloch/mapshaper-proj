var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('eqc.js', function () {

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

  var s_fwd_expect = [
    [ 223402.144255274179,  111701.07212763709],
    [ 223402.144255274179, -111701.07212763709],
    [-223402.144255274179,  111701.07212763709],
    [-223402.144255274179, -111701.07212763709]
  ];

  var s_inv_expect = [
    [ 0.00179049310978382265,  0.000895246554891911323],
    [ 0.00179049310978382265, -0.000895246554891911323],
    [-0.00179049310978382265,  0.000895246554891911323],
      [-0.00179049310978382265, -0.000895246554891911323]
  ];

  var sargs = "+proj=eqc   +a=6400000    +lat_1=0.5 +lat_2=2";

  helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  helpers.inv_test(sargs, inv_in, s_inv_expect);
});
