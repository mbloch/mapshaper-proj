var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('crast.js', function () {

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

  describe('Craster Parabolic', function () {

    var s_fwd_expect = [
    [218280.142056780722,  114306.045604279774],
    [218280.142056780722,  -114306.045604279774],
    [-218280.142056780722,  114306.045604279774],
    [-218280.142056780722,  -114306.045604279774]
    ];

    var s_inv_expect = [
    [0.00183225941982580187,  0.00087483943098902331],
    [0.00183225941982580187,  -0.00087483943098902331],
    [-0.00183225941982580187,  0.00087483943098902331],
    [-0.00183225941982580187,  -0.00087483943098902331]
    ];

    var sargs = "+proj=crast   +a=6400000    +lat_1=0.5 +lat_2=2";
    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
    helpers.inv_test(sargs, inv_in, s_inv_expect);
  })

});
