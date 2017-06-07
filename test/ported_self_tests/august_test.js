var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('august.js', function () {

  var fwd_in = [
    [ 2, 1],
    [ 2,-1],
    [-2, 1],
    [-2,-1]
  ];


  describe('August', function () {

    var s_fwd_expect = [
    [223404.97818097242,  111722.34028976287],
    [223404.97818097242,  -111722.34028976287],
    [-223404.97818097242,  111722.34028976287],
    [-223404.97818097242,  -111722.34028976287]
    ];

    var sargs = "+proj=august   +a=6400000    +lat_1=0 +lat_2=2";
    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  })

});
