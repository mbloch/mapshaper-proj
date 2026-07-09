var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('robin.js', function () {

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
    [ 189588.423282507836,  107318.530350702888],
    [ 189588.423282507836, -107318.530350702888],
    [-189588.423282507836,  107318.530350702888],
    [-189588.423282507836, -107318.530350702888]
  ];

  var s_inv_expect = [
    [ 0.002109689065506131,  0.000931805533547745983],
    [ 0.002109689065506131, -0.000931805533547745983],
    [-0.002109689065506131,  0.000931805533547745983],
    [-0.002109689065506131, -0.000931805533547745983]
  ];

  var sargs = "+proj=robin   +a=6400000    +lat_1=0.5 +lat_2=2";

  helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
  helpers.inv_test(sargs, inv_in, s_inv_expect);

  it('preserves the antimeridian side in round trips', function() {
    var P = api.pj_init(sargs);
    var latitudes = [-90, -60, -20, 0, 20, 60, 90];
    [-180, 180].forEach(function(lon) {
      latitudes.forEach(function(lat) {
        var xy = api.pj_fwd_deg({lam: lon, phi: lat}, P);
        var lp = api.pj_inv_deg({x: xy.x, y: xy.y}, P);
        assert.ok(isFinite(lp.lam));
        assert.ok(Math.abs(lp.lam - lon) < 1e-6);
        assert.ok(Math.abs(lp.phi - lat) < 1e-6);
      });
    });
  });

  it('rejects inverse longitudes outside the projection domain', function() {
    var P = api.pj_init(sargs);
    var lp = api.pj_inv({x: 4 * 6400000, y: 0.5 * 6400000}, P);
    assert.equal(lp.lam, Infinity);
    assert.equal(lp.phi, Infinity);
  });
});
