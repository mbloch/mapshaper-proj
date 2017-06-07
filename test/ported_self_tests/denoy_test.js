var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('denoy.js', function () {

  var fwd_in = [
    [ 2, 1],
    [ 2,-1],
    [-2, 1],
    [-2,-1]
  ];


  describe('Denoyer Semi-Elliptical', function () {

    var s_fwd_expect = [
    [ 223377.422876954137,  111701.07212763709],
    [ 223377.422876954137, -111701.07212763709],
    [-223377.422876954137,  111701.07212763709],
    [-223377.422876954137, -111701.07212763709]
    ];

    var sargs = "+proj=denoy   +a=6400000    +lat_1=0 +lat_2=2";
    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  })

});
