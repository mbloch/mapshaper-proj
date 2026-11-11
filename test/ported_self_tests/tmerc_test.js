var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('tmerc.js', function () {

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
    [ 223413.46640632232,  111769.14504059685],
    [ 223413.46640632232, -111769.14504059685],
    [-223413.46640632208,  111769.14504059685],
    [-223413.46640632208, -111769.14504059685]
  ];

  // latitudes from a 50-digit computation; the previous values were 1.5e-10
  // deg off (asin of a value close to 0 computed as sqrt(1 - h * h))
  var s_inv_expect = [
    [ 0.0017904931097048034,  0.00089524655445477916],
    [ 0.0017904931097048034, -0.00089524655445477916],
    [-0.001790493109714345,   0.00089524655445477916],
    [-0.001790493109714345,  -0.00089524655445477916]
  ];

  var e_fwd_expect = [
    [ 222650.79679577847,  110642.22941192707],
    [ 222650.79679577847, -110642.22941192707],
    [-222650.79679577847,  110642.22941192707],
    [-222650.79679577847, -110642.22941192707]
  ];

  var e_inv_expect = [
    [ 0.0017966305681649396,  0.00090436947663183841],
    [ 0.0017966305681649396, -0.00090436947663183841],
    [-0.0017966305681649396,  0.00090436947663183841],
    [-0.0017966305681649396, -0.00090436947663183841]
  ];

  var sargs = "+proj=tmerc   +a=6400000    +lat_1=0.5 +lat_2=2 +n=0.5";
  var eargs = "+proj=tmerc   +ellps=GRS80  +lat_1=0.5 +lat_2=2 +n=0.5";

  helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  helpers.inv_test(sargs, inv_in, s_inv_expect);
  helpers.fwd_test(eargs, fwd_in, e_fwd_expect);
  helpers.inv_test(eargs, inv_in, e_inv_expect);
});
