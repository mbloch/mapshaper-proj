var assert = require('assert'),
    api = require('../'),
    helpers = require('./helpers');

describe('omerc.js', function () {

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

  describe('Oblique Mercator', function () {

    var e_fwd_expect = [
    [ 222650.796885261341,  110642.229314983808],
    [ 222650.796885261341, -110642.229314983808],
    [-222650.796885261545,  110642.229314983808],
    [-222650.796885261545, -110642.229314983808]
    ];

    var e_inv_expect = [
    [ 0.00179663056816996357,  0.000904369474808157338],
    [ 0.00179663056816996357, -0.000904369474820879583],
    [-0.0017966305681604536,   0.000904369474808157338],
    [-0.0017966305681604536,  -0.000904369474820879583]
    ];

    var eargs = "+proj=omerc   +ellps=GRS80  +lat_1=0.5 +lat_2=2";

    helpers.fwd_test(eargs, fwd_in, e_fwd_expect);
    helpers.inv_test(eargs, inv_in, e_inv_expect);
  })

});
