var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('hatano.js', function () {

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

  describe('Hatano', function () {

    var s_fwd_expect = [
    [ 189878.87894652804,  131409.8024406255],
    [ 189881.08195244463, -131409.14227607418],
    [-189878.87894652804,  131409.8024406255],
    [-189881.08195244463, -131409.14227607418]
    ];

    var s_inv_expect = [
    [ 0.0021064624821817597,  0.00076095689425791926],
    [ 0.0021064624821676096, -0.00076095777439265377],
    [-0.0021064624821817597,  0.00076095689425791926],
    [-0.0021064624821676096, -0.00076095777439265377]
    ];

    var sargs = "+proj=hatano   +a=6400000    +lat_1=0.5 +lat_2=2";
    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
    helpers.inv_test(sargs, inv_in, s_inv_expect);
  })

});
