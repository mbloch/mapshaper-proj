var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('mill.js', function () {

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
    [ 223402.144255274179,  111704.701754393827],
    [ 223402.144255274179, -111704.701754396243],
    [-223402.144255274179,  111704.701754393827],
    [-223402.144255274179, -111704.701754396243]
  ];

  var s_inv_expect = [
    [ 0.00179049310978382265,  0.000895246554873922024],
    [ 0.00179049310978382265, -0.000895246554873922024],
    [-0.00179049310978382265,  0.000895246554873922024],
    [-0.00179049310978382265, -0.000895246554873922024]
  ];

  var sargs = "+proj=mill   +a=6400000    +lat_1=0.5 +lat_2=2";

  helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  helpers.inv_test(sargs, inv_in, s_inv_expect);
});
