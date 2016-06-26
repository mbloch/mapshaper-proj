var assert = require('assert'),
    api = require('../'),
    helpers = require('./helpers');

describe('gnom.js', function () {

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
        [ 223492.92474718543,  111780.50920659291],
        [ 223492.92474718543, -111780.50920659291],
        [-223492.92474718543,  111780.50920659291],
        [-223492.92474718543, -111780.50920659291]
  ];

  var s_inv_expect = [
        [ 0.0017904931092009798,  0.00089524655438192376],
        [ 0.0017904931092009798, -0.00089524655438192376],
        [-0.0017904931092009798,  0.00089524655438192376],
        [-0.0017904931092009798, -0.00089524655438192376]
  ];

  var sargs = "+proj=gnom   +a=6400000    +lat_1=0.5 +lat_2=2";

  helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  helpers.inv_test(sargs, inv_in, s_inv_expect);
});
