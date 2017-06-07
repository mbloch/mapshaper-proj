var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('bacon.js', function () {

  var fwd_in = [
    [ 2, 1],
    [ 2,-1],
    [-2, 1],
    [-2,-1]
  ];

  describe('Apian Globular I', function () {

    var s_fwd_expect = [
    [ 223374.57735525275,   111701.07212763709],
    [ 223374.57735525275,  -111701.07212763709],
    [-223374.57735525275,   111701.07212763709],
    [-223374.57735525275,  -111701.07212763709]
    ];

    var sargs = "+proj=apian   +a=6400000    +lat_1=0 +lat_2=2";
    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  })

  describe('Ortelius Oval', function () {

    var s_fwd_expect = [
    [ 223374.57735525275,   111701.07212763709],
    [ 223374.57735525275,  -111701.07212763709],
    [-223374.57735525275,   111701.07212763709],
    [-223374.57735525275,  -111701.07212763709]
    ];

    var sargs = "+proj=ortel   +a=6400000    +lat_1=0 +lat_2=2";
    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  })

  describe('Bacon Globular', function () {

    var s_fwd_expect = [
    [223334.13255596498,  175450.72592266591],
    [223334.13255596498,  -175450.72592266591],
    [-223334.13255596498,  175450.72592266591],
    [-223334.13255596498,  -175450.72592266591]
    ];

    var sargs = "+proj=bacon   +a=6400000    +lat_1=0 +lat_2=2";
    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  })

});
