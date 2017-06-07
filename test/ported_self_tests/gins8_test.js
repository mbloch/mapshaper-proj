var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('gins8.js', function () {

  var fwd_in = [
    [ 2, 1],
    [ 2,-1],
    [-2, 1],
    [-2,-1]
  ];


  describe('Ginsburg VIII', function () {

    var s_fwd_expect = [
    [ 194350.25093959007,  111703.90763533533],
    [ 194350.25093959007, -111703.90763533533],
    [-194350.25093959007,  111703.90763533533],
    [-194350.25093959007, -111703.90763533533]
    ];

    var sargs = "+proj=gins8   +a=6400000    +lat_1=0 +lat_2=2";
    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  })

});
