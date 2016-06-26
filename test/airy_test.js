var assert = require('assert'),
    api = require('../'),
    helpers = require('./helpers');

describe('airy.js', function () {

  var fwd_in = [
    [ 2, 1],
    [ 2,-1],
    [-2, 1],
    [-2,-1]
  ];

  describe('Airy', function () {
    var s_fwd_expect = [
     [ 189109.88690862127,   94583.752387504152],
     [ 189109.88690862127,  -94583.752387504152],
     [-189109.88690862127,   94583.752387504152],
     [-189109.88690862127,  -94583.752387504152]
    ];

    var sargs = "+proj=airy   +a=6400000    +lat_1=0 +lat_2=2";

    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  })
});
