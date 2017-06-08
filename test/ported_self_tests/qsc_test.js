var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('qsc.js', function () {

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

  describe('Quadrilateralized Spherical Cube', function () {

    var e_fwd_expect = [
    [ 304638.450843852363,  164123.870923793991],
    [ 304638.450843852363, -164123.870923793991],
    [-304638.450843852363,  164123.870923793962],
    [-304638.450843852421, -164123.870923793904]
    ];

    var e_inv_expect = [
    [ 0.00132134098471627126,  0.000610652900922527926],
    [ 0.00132134098471627126, -0.000610652900922527926],
    [-0.00132134098471627126,  0.000610652900922527926],
    [-0.00132134098471627126, -0.000610652900922527926]
    ];

    var eargs = "+proj=qsc +ellps=GRS80 +lat_1=0.5 +lat_2=2";
    helpers.fwd_test(eargs, fwd_in, e_fwd_expect);
    helpers.inv_test(eargs, inv_in, e_inv_expect);
  })

});
