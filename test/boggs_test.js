var assert = require('assert'),
    api = require('../'),
    helpers = require('./helpers');

describe('boggs.js', function () {

  var fwd_in = [
    [ 2, 1],
    [ 2,-1],
    [-2, 1],
    [-2,-1]
  ];

  var s_fwd_expect = [
    [ 211949.70080818201,   117720.99830541089],
    [ 211949.70080818201,  -117720.99830541089],
    [-211949.70080818201,   117720.99830541089],
    [-211949.70080818201,  -117720.99830541089]
  ];

  var sargs = "+proj=boggs   +a=6400000    +lat_1=0 +lat_2=2";
  helpers.fwd_test(sargs, fwd_in, s_fwd_expect);

});
