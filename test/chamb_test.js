var assert = require('assert'),
    api = require('../'),
    helpers = require('./helpers');

describe('chamb.js', function () {

  var fwd_in = [
    [ 2, 1],
    [ 2,-1],
    [-2, 1],
    [-2,-1]
  ];

  describe('Chamberlin Trimetric', function () {
    var s_fwd_expect = [
     [-2268126.571005206089, 2588394.127868260723],
     [-2271989.262267768849, 2362083.871856109239],
     [-2710092.019056153949, 2605936.202218807302],
     [-2714768.974863475189, 2377623.170090894215]
    ];

    var sargs = "+proj=chamb +a=6400000 +lat_1=22N +lon_1=0 +lat_2=22N +lon_2=45E +lat_3=22S +lon_3=22.5E";

    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  })
});
