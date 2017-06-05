var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('nzmg.js', function () {

  var fwd_in = [
    [ 2, 1],
    [ 2,-1],
    [-2, 1],
    [-2,-1]
  ];

  var inv_in = [
    [ 200000, 100000],
    [ 200000,-100000],
    [-200000, 100000],
    [-200000,-100000]
  ];

  describe('New Zealand Map Grid', function () {

    var e_fwd_expect = [
      [3352675144.74742508,  -7043205391.10024357],
      [3691989502.77930641,  -6729069415.33210468],
      [4099000768.45323849,  -7863208779.66724873],
      [4466166927.36997604,  -7502531736.62860489]
    ];

    var e_inv_expect = [
      [175.48208682711271,  -69.4226921826331846],
      [175.756819472543611, -69.5335710883796168],
      [134.605119233460016, -61.4599957106629091],
      [134.333684315954827, -61.6215536756024349]
    ];

    var eargs = "+proj=nzmg +ellps=GRS80 +lat_1=0.5 +lat_2=2";
    helpers.fwd_test(eargs, fwd_in, e_fwd_expect);
    helpers.inv_test(eargs, inv_in, e_inv_expect);
  })

});
