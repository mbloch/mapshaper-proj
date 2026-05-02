var assert = require('assert');
var fs = require('fs');
var path = require('path');
var api = require('../');

describe('WKT2 COMPOUNDCRS handling', function() {
  it('uses horizontal component of a projected+vertical compound CRS', function() {
    var file = path.join(__dirname, 'wkt2', 'other', 'compound_crs_example1.wkt2');
    var wkt = fs.readFileSync(file, 'utf8');
    var proj4 = api.internal.wkt2_to_proj4(wkt);
    assert.equal(proj4, '+proj=tmerc +lon_0=-63 +k_0=0.9996 +x_0=500000 +ellps=GRS80 +no_defs');
  });

  it('uses horizontal component wrapped in nested COMPONENT blocks', function() {
    var wkt = 'COMPOUNDCRS["Wrapped compound",' +
      'COMPONENT["Horizontal component",' +
      'PROJCRS["WGS84 / UTM zone 18N",' +
      'BASEGEOGCRS["WGS 84",' +
      'ENSEMBLE["World Geodetic System 1984 ensemble",' +
      'MEMBER["World Geodetic System 1984"],' +
      'ELLIPSOID["WGS 84",6378137,298.257223563,LENGTHUNIT["metre",1]],' +
      'ENSEMBLEACCURACY[2.0]],' +
      'PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]],' +
      'ID["EPSG",4326]],' +
      'CONVERSION["UTM zone 18N",' +
      'METHOD["Transverse Mercator",ID["EPSG",9807]],' +
      'PARAMETER["Latitude of natural origin",0,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8801]],' +
      'PARAMETER["Longitude of natural origin",-75,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8802]],' +
      'PARAMETER["Scale factor at natural origin",0.9996,SCALEUNIT["unity",1],ID["EPSG",8805]],' +
      'PARAMETER["False easting",500000,LENGTHUNIT["metre",1],ID["EPSG",8806]],' +
      'PARAMETER["False northing",0,LENGTHUNIT["metre",1],ID["EPSG",8807]]],' +
      'CS[Cartesian,2],' +
      'AXIS["(E)",east,ORDER[1],LENGTHUNIT["metre",1]],' +
      'AXIS["(N)",north,ORDER[2],LENGTHUNIT["metre",1]]]],' +
      'COMPONENT["Vertical component",' +
      'VERTCRS["EGM96 height",VDATUM["EGM96 geoid"],CS[vertical,1],AXIS["gravity-related height",up,LENGTHUNIT["metre",1]]]]' +
      ']';
    var proj4 = api.internal.wkt2_to_proj4(wkt);
    assert.equal(proj4, '+proj=utm +zone=18 +datum=WGS84 +no_defs');
  });
});
