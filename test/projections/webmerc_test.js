
var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('+proj=webmerc', function () {
  var webmerc = '+proj=webmerc +datum=WGS84';
  var merc = '+proj=merc +a=6378137 +b=6378137';

  it('test1', function() {
    helpers.proj_roundtrip(webmerc, [83, 3]);
  });

  it('test2', function() {
    var p = [-83, -3];
    assert.deepEqual(helpers.proj_fwd(webmerc, p), helpers.proj_fwd(merc, p))
  });

  it('test3', function() {
    var p = [-9239517, -334111];
    assert.deepEqual(helpers.proj_inv(webmerc, p), helpers.proj_inv(merc, p))
  });
});