var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('eqearth.js', function() {
  var args = '+proj=eqearth +a=6400000';

  helpers.fwd_test(args, [[2, 1], [-2, -1]], [
    [192457.4623920805, 129648.29470155617],
    [-192457.4623920805, -129648.29470155617]
  ]);

  it('clamps inverse coordinates to the vertical map extent', function() {
    var P = api.pj_init(args);
    var lp = api.pj_inv({x: 0, y: 2 * 6400000}, P);
    assert.ok(isFinite(lp.lam));
    assert.ok(isFinite(lp.phi));
    assert.ok(Math.abs(lp.phi) <= Math.PI / 2);
  });
});
