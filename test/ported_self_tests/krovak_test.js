var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('krovak.js', function () {

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

  describe('Krovak', function () {

    var e_fwd_expect = [
      [-3196535.2325636409,  -6617878.8675514441],
      [-3260035.4405521089,  -6898873.6148780314],
      [-3756305.3288691747,  -6478142.5615715114],
      [-3831703.6585019818,  -6759107.1701553948]
    ];

    var e_inv_expect = [
      [24.836218918719162,  59.758403933233858],
      [24.836315484509566,  59.756888425730189],
      [24.830447747947495,  59.758403933233858],
      [24.830351182157091,  59.756888425730189]
    ];

    var eargs = "+proj=krovak +ellps=GRS80  +no_defs";

    helpers.fwd_test(eargs, fwd_in, e_fwd_expect);
    helpers.inv_test(eargs, inv_in, e_inv_expect);
  })

});
