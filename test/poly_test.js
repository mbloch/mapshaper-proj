var assert = require('assert'),
    api = require('../'),
    helpers = require('./helpers');

describe('aeqd.js', function () {

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

  var s_fwd_expect = [
    [ 223368.105210218986,  111769.110491224754],
    [ 223368.105210218986, -111769.110491224754],
    [-223368.105210218986,  111769.110491224754],
    [-223368.105210218986, -111769.110491224754]
  ];

  var s_inv_expect = [
    [ 0.0017904931100023887,  0.000895246554454779222],
    [ 0.0017904931100023887, -0.000895246554454779222],
    [-0.0017904931100023887,  0.000895246554454779222],
    [-0.0017904931100023887, -0.000895246554454779222]
  ];

  var e_fwd_expect = [
    [ 222605.285770237475,  110642.194561440483],
    [ 222605.285770237475, -110642.194561440483],
    [-222605.285770237475,  110642.194561440483],
    [-222605.285770237475, -110642.194561440483]
  ];

  var e_inv_expect = [
    [ 0.00179663056846135222,  0.000904369476631838518],
    [ 0.00179663056846135222, -0.000904369476631838518],
    [-0.00179663056846135222,  0.000904369476631838518],
    [-0.00179663056846135222, -0.000904369476631838518]
  ];

  var sargs = "+proj=poly   +a=6400000    +lat_1=0.5 +lat_2=2";
  var eargs = "+proj=poly   +ellps=GRS80  +lat_1=0.5 +lat_2=2";

  helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  helpers.inv_test(sargs, inv_in, s_inv_expect);
  helpers.fwd_test(eargs, fwd_in, e_fwd_expect);
  helpers.inv_test(eargs, inv_in, e_inv_expect);
});
