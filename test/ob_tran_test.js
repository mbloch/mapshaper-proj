var assert = require('assert'),
    api = require('../'),
    helpers = require('./helpers');

describe('ob_tran.js', function () {

  // TODO: reconcile JS and Proj.4 implementations
  return;

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
    [-2.6856872138416592, 1.2374302350496296],
    [-2.6954069748943286, 1.2026833954513816],
    [-2.8993663925401947, 1.2374302350496296],
    [-2.8896466314875244, 1.2026833954513816]
  ];

  var s_inv_expect = [
    [ 121.5518748407577,  -2.5361001573966084],
    [ 63.261184340201858,  17.585319578673531],
    [-141.10073322351622,  26.091712304855108],
    [-65.862385598848391,  51.830295078417215]
  ];

  var sargs = "+proj=ob_tran +a=6400000 +o_proj=latlon +o_lon_p=20 +o_lat_p=20 +lon_0=180";

  helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  helpers.inv_test(sargs, inv_in, s_inv_expect);
});
