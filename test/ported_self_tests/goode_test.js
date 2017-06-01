var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('goode.js', function () {

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

  describe('Goode Homolosine', function () {

    var s_fwd_expect = [
    [ 223368.11902663155,  111701.07212763709],
    [ 223368.11902663155, -111701.07212763709],
    [-223368.11902663155,  111701.07212763709],
    [-223368.11902663155, -111701.07212763709]
    ];

    var s_inv_expect = [
    [ 0.0017904931100023887,  0.00089524655489191132],
    [ 0.0017904931100023887, -0.00089524655489191132],
    [-0.0017904931100023887,  0.00089524655489191132],
    [-0.0017904931100023887, -0.00089524655489191132]
    ];

    var sargs = "+proj=goode   +a=6400000    +lat_1=0.5 +lat_2=2";

    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
    helpers.inv_test(sargs, inv_in, s_inv_expect);

  })

});
