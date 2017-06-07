var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('hammer.js', function () {

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

  describe('Hammer', function () {

    var s_fwd_expect = [
     [ 223373.78870324057,  111703.90739776699],
     [ 223373.78870324057, -111703.90739776699],
     [-223373.78870324057,  111703.90739776699],
     [-223373.78870324057, -111703.90739776699]
    ];

    var s_inv_expect = [
     [ 0.001790493109965961,  0.00089524655487369749],
     [ 0.001790493109965961, -0.00089524655487369749],
     [-0.001790493109965961,  0.00089524655487369749],
     [-0.001790493109965961, -0.00089524655487369749]
    ];

    var sargs = "+proj=hammer   +a=6400000    +lat_1=0.5 +lat_2=2";
    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
    helpers.inv_test(sargs, inv_in, s_inv_expect);
  })

});
