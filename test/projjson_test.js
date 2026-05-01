var assert = require('assert');
var api = require('../');
var fs = require('fs');
var path = require('path');

function normalizeProj4(s) {
  return String(s || '').split(/\s+/).filter(function(t) {
    if (!t || t === '+no_defs' || t === '+type=crs') return false;
    if (t === '+lat_0=0') return false;
    return true;
  }).sort().join(' ');
}

describe('PROJJSON bridge', function() {
  it('projjson_to_proj4 accepts EPSG:4326-style lat/lon axes', function() {
    var obj = {
      type: 'GeographicCRS',
      name: 'WGS 84',
      datum_ensemble: {
        name: 'World Geodetic System 1984 ensemble',
        ellipsoid: {
          name: 'WGS 84',
          semi_major_axis: 6378137,
          inverse_flattening: 298.257223563
        }
      },
      prime_meridian: {name: 'Greenwich', longitude: 0},
      coordinate_system: {
        subtype: 'ellipsoidal',
        axis: [
          {name: 'Geodetic latitude', abbreviation: 'Lat', direction: 'north', unit: 'degree'},
          {name: 'Geodetic longitude', abbreviation: 'Lon', direction: 'east', unit: 'degree'}
        ]
      },
      id: {authority: 'EPSG', code: 4326}
    };
    var proj4 = api.internal.projjson_to_proj4(JSON.stringify(obj));
    assert.equal(normalizeProj4(proj4), normalizeProj4('+proj=longlat +datum=WGS84'));
  });

  it('roundtrips projected definitions through PROJJSON object form', function() {
    var p4 = '+proj=tmerc +lat_0=49 +lon_0=-2 +k_0=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +no_defs';
    var pj = api.internal.projjson_from_proj4(p4, {as_object: true});
    assert.equal(pj.type, 'ProjectedCRS');
    var rt = api.internal.projjson_to_proj4(pj);
    assert.equal(normalizeProj4(rt), normalizeProj4(p4));
  });

  it('preserves towgs84 via BoundCRS transformation', function() {
    var p4 = '+proj=tmerc +lat_0=0 +lon_0=27 +x_0=3500000 +ellps=intl +towgs84=-96.062,-82.428,-121.753,4.801,0.345,-1.376,1.496 +no_defs';
    var pj = api.internal.projjson_from_proj4(p4, {as_object: true});
    assert.equal(pj.type, 'BoundCRS');
    var rt = api.internal.projjson_to_proj4(pj);
    assert.equal(normalizeProj4(rt), normalizeProj4(p4));
  });

  it('converts sample EPSG:4326 PROJJSON fixture', function() {
    var file = path.join(__dirname, 'projjson', 'epsg4326_from_spatialreference.json');
    var obj = JSON.parse(fs.readFileSync(file, 'utf8'));
    var proj4 = api.internal.projjson_to_proj4(obj);
    assert.equal(normalizeProj4(proj4), normalizeProj4('+proj=longlat +datum=WGS84'));
  });

  it('converts sample custom Orthographic PROJJSON fixture', function() {
    var file = path.join(__dirname, 'projjson', 'custom_crs_example.json');
    var obj = JSON.parse(fs.readFileSync(file, 'utf8'));
    var proj4 = api.internal.projjson_to_proj4(obj);
    // Don't over-specify defaults; assert key semantics.
    assert.ok(/\+proj=ortho\b/.test(proj4), proj4);
    assert.ok(/\+lat_0=43\.88\b/.test(proj4), proj4);
    assert.ok(/\+lon_0=-72\.69\b/.test(proj4), proj4);
  });
});
