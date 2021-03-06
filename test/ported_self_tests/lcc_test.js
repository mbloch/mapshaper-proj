var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('lcc.js', function () {

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

  var e_fwd_expect = [
    [ 222588.439735968423,  110660.533870799671],
    [ 222756.879700278747, -110532.797660827026],
    [-222588.439735968423,  110660.533870799671],
    [-222756.879700278747, -110532.797660827026]
  ];

  var e_inv_expect = [
    [ 0.00179635940600536667,  0.000904232207322381741],
    [ 0.00179635817735249777, -0.000904233135128348995],
    [-0.00179635940600536667,  0.000904232207322381741],
    [-0.00179635817735249777, -0.000904233135128348995]
  ];

  var eargs = "+proj=lcc   +ellps=GRS80  +lat_1=0.5 +lat_2=2";

  helpers.fwd_test(eargs, fwd_in, e_fwd_expect);
  helpers.inv_test(eargs, inv_in, e_inv_expect);
});
