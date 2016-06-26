var assert = require('assert'),
    api = require('../'),
    helpers = require('./helpers');

describe('wink.js', function () {

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

  describe('Winkel I', function () {

    var s_fwd_expect = [
    [ 223385.13164095284,  111701.07212763709],
    [ 223385.13164095284,  -111701.07212763709],
    [-223385.13164095284,  111701.07212763709],
    [-223385.13164095284,  -111701.07212763709]
    ];

    var s_inv_expect = [
      [ 0.0017904931098931057,  0.00089524655489191132],
      [ 0.0017904931098931057, -0.00089524655489191132],
      [-0.0017904931098931057,  0.00089524655489191132],
      [-0.0017904931098931057, -0.00089524655489191132]
    ];

    var sargs = "+proj=wink1   +a=6400000    +lat_1=0.5 +lat_2=2";

    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
    helpers.inv_test(sargs, inv_in, s_inv_expect);
  })

  describe('Winkel II', function () {
    var s_fwd_expect = [
      [ 223387.39643378611,  124752.03279744535],
      [ 223387.39643378611, -124752.03279744535],
      [-223387.39643378611,  124752.03279744535],
      [-223387.39643378611, -124752.03279744535]
    ];

    var sargs = "+proj=wink2   +a=6400000    +lat_1=0.5 +lat_2=2";

    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  })


});
