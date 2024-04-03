
var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('geos.js', function () {
  it('test1', function() {
    var proj4 = '+proj=geos +h=35785831.0 +lon_0=60 +sweep=y +datum=WGS84';
    helpers.proj_roundtrip(proj4, [83, 3]);
  });

  it('test2', function() {
    var proj4 = '+proj=geos +h=35785831.0 +lon_0=60 +sweep=y +R=6378137';
    helpers.proj_roundtrip(proj4, [83, 3]);
  })

});