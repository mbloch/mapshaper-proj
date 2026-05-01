var assert = require('assert');
var api = require('../');

describe('pj_transform +axis handling', function () {
  it('swaps lon/lat when converting enu -> neu on longlat CRS', function () {
    var src = api.pj_init('+proj=longlat +datum=WGS84 +axis=enu');
    var dst = api.pj_init('+proj=longlat +datum=WGS84 +axis=neu');

    var lonDeg = -73.9857;
    var latDeg = 40.7484;
    var z = 123.456;

    // pj_transform expects radians for longlat coordinate arrays.
    var xIn = lonDeg * api.internal.DEG_TO_RAD;
    var yIn = latDeg * api.internal.DEG_TO_RAD;
    var xx = [xIn];
    var yy = [yIn];
    var zz = [z];
    var err = api.pj_transform(src, dst, xx, yy, zz);

    assert.strictEqual(err, 0);
    assert.strictEqual(xx[0], yIn);
    assert.strictEqual(yy[0], xIn);
    assert.strictEqual(zz[0], z);
  });

  it('swaps lat/lon when converting neu -> enu on longlat CRS', function () {
    var src = api.pj_init('+proj=longlat +datum=WGS84 +axis=neu');
    var dst = api.pj_init('+proj=longlat +datum=WGS84 +axis=enu');

    var lonDeg = -73.9857;
    var latDeg = 40.7484;
    var z = 123.456;

    // Source axis=neu means input order is [lat, lon].
    var xIn = latDeg * api.internal.DEG_TO_RAD;
    var yIn = lonDeg * api.internal.DEG_TO_RAD;
    var xx = [xIn];
    var yy = [yIn];
    var zz = [z];
    var err = api.pj_transform(src, dst, xx, yy, zz);

    assert.strictEqual(err, 0);
    assert.strictEqual(xx[0], yIn);
    assert.strictEqual(yy[0], xIn);
    assert.strictEqual(zz[0], z);
  });
});

describe('pj_transform_point +axis handling', function () {
  it('swaps lon/lat when converting enu -> neu on longlat CRS', function () {
    var src = api.pj_init('+proj=longlat +datum=WGS84 +axis=enu');
    var dst = api.pj_init('+proj=longlat +datum=WGS84 +axis=neu');

    var lonDeg = -73.9857;
    var latDeg = 40.7484;
    var p = [lonDeg, latDeg, 123.456];

    api.pj_transform_point(src, dst, p);

    assert.strictEqual(p[0], latDeg);
    assert.strictEqual(p[1], lonDeg);
    assert.strictEqual(p[2], 123.456);
  });

  it('swaps lat/lon when converting neu -> enu on longlat CRS', function () {
    var src = api.pj_init('+proj=longlat +datum=WGS84 +axis=neu');
    var dst = api.pj_init('+proj=longlat +datum=WGS84 +axis=enu');

    var lonDeg = -73.9857;
    var latDeg = 40.7484;
    // Source axis=neu means point order is [lat, lon].
    var p = [latDeg, lonDeg, 123.456];

    api.pj_transform_point(src, dst, p);

    assert.strictEqual(p[0], lonDeg);
    assert.strictEqual(p[1], latDeg);
    assert.strictEqual(p[2], 123.456);
  });
});
