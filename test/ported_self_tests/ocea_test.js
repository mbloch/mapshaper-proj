var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('ocea.js', function () {

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
     [127964312562778.156,  1429265667691.05786],
     [129394957619297.641,  1429265667691.06812],
     [127964312562778.188, -1429265667691.0498],
     [129394957619297.688, -1429265667691.03955]
  ];

  var s_inv_expect = [
     [ 179.999999999860108,  2.79764548403721305e-10],
     [-179.999999999860108,  2.7976454840372327e-10],
     [ 179.999999999860108, -2.7976454840372327e-10],
     [-179.999999999860108, -2.79764548403721305e-10]
  ];

  var sargs = "+proj=ocea   +a=6400000    +lat_1=0.5 +lat_2=2";

  helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  helpers.inv_test(sargs, inv_in, s_inv_expect);
});