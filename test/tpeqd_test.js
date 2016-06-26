var assert = require('assert'),
    api = require('../'),
    helpers = require('./helpers');

describe('tpeqd.js', function () {

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
    [-27845.882978485075,  -223362.43069526015],
    [-251293.37876465076,  -223419.15898590829],
    [-27845.882978485075,  223362.43069526015],
    [-251293.37876465076,  223419.15898590829]
  ];

  var s_inv_expect = [
    [-0.00089548606640108474,  1.2517904929571837],
    [0.0008954860663883625,  1.2517904929571837],
    [-0.000895484845182587,  1.248209506737604],
    [0.00089548484516986475,  1.248209506737604]
  ];

  var e_fwd_expect = [
    [-27750.758831679042,  -222599.40369177726],
    [-250434.93702403645,  -222655.93819326628],
    [-27750.758831679042,  222599.40369177726],
    [-250434.93702403645,  222655.93819326628]
  ];

  var e_inv_expect = [
    [-0.00089855554821257374,  1.2517966304145272],
    [0.0008985555481998515,  1.2517966304145272],
    [-0.00089855431859741167,  1.2482033692781642],
    [0.00089855431859741167,  1.2482033692781642]
  ];

  var sargs = "+proj=tpeqd   +a=6400000    +lat_1=0.5 +lat_2=2 +n=0.5";
  var eargs = "+proj=tpeqd   +ellps=GRS80  +lat_1=0.5 +lat_2=2 +n=0.5";

  helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  helpers.inv_test(sargs, inv_in, s_inv_expect);
  helpers.fwd_test(eargs, fwd_in, e_fwd_expect);
  helpers.inv_test(eargs, inv_in, e_inv_expect, 1e-6); // TODO: investigate slight inconsistency
});
