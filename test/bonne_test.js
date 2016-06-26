var assert = require('assert'),
    api = require('../'),
    helpers = require('./helpers');

describe('bonne.js', function () {

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
    [ 223368.11557252839,   55884.555246393575],
    [ 223368.11557463196,  -167517.59936969393],
    [-223368.11557252839,   55884.555246393575],
    [-223368.11557463196,  -167517.59936969393]
  ];

  var s_inv_expect = [
    [ 0.0017905615332457991,  0.50089524631087834],
    [ 0.0017905610449335603,  0.49910475320072978],
    [-0.0017905615332457991,  0.50089524631087834],
    [-0.0017905610449335603,  0.49910475320072978]
  ];

  var e_fwd_expect = [
    [ 222605.29609715697,   55321.139565494814],
    [ 222605.29609923941,  -165827.64779905154],
    [-222605.29609715697,   55321.139565494814],
    [-222605.29609923941,  -165827.64779905154]
  ];

  var e_inv_expect = [
    [ 0.0017966987691132891,  0.50090436853737497],
    [ 0.0017966982774478867,  0.4990956309655612],
    [-0.0017966987691132891,  0.50090436853737497],
    [-0.0017966982774478867,  0.4990956309655612]
  ];

  var sargs = "+proj=bonne   +a=6400000    +lat_1=0.5 +lat_2=2";
  var eargs = "+proj=bonne   +ellps=GRS80  +lat_1=0.5 +lat_2=2";

  helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  helpers.inv_test(sargs, inv_in, s_inv_expect);
  helpers.fwd_test(eargs, fwd_in, e_fwd_expect);
  helpers.inv_test(eargs, inv_in, e_inv_expect);
});
