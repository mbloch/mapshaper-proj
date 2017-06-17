var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('urm5.js', function () {

  var fwd_in = [
    [ 2, 1],
    [ 2,-1],
    [-2, 1],
    [-2,-1]
  ];

  var s_fwd_expect = [
    [ 223393.6384339639,  111696.81878511712],
    [ 223393.6384339639, -111696.81878511712],
    [-223393.6384339639,  111696.81878511712],
    [-223393.6384339639, -111696.81878511712]
  ];

  var sargs = "+proj=urm5   +a=6400000    +lat_1=0 +lat_2=2 +n=0.5";
  helpers.fwd_test(sargs, fwd_in, s_fwd_expect);

});
