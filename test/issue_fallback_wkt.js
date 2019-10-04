var assert = require('assert'),
    api = require('..'),
    fs = require('fs'),
    wkt_parse = api.internal.wkt_parse;

describe('Fallback WKT files with embedded Proj.4 strings', function () {
  it('WKT object is generated', function() {
    var P = api.pj_init("+proj=eqearth +datum=WGS84");
    var o = api.internal.wkt_make_projcs(P);
    assert.deepEqual(o.PROJCS.EXTENSION, ["PROJ4", "+proj=eqearth +datum=WGS84 +wktext"]);
  })

  it('.prj file is converted to Proj.4', function() {
    var str = fs.readFileSync('test/prj/issues/qgis_eqearth.prj', 'utf8');
    var proj4 = api.internal.wkt_to_proj4(str);
    assert.equal(proj4, "+proj=eqearth +datum=WGS84");
  })

  it('Patterson round trip', function() {
    var input = "+proj=patterson +datum=WGS84";
    var wkt = api.internal.wkt_from_proj4(input);
    var output = api.internal.wkt_to_proj4(wkt);
    assert.equal(input, output);
  })

  it('EXTENSION is parsed', function () {
    var str = fs.readFileSync('test/prj/issues/qgis_eqearth.prj', 'utf8');
    var expect = {
      PROJCS: {
        NAME: "unnamed",
        GEOGCS: {
          NAME: "WGS 84",
          DATUM: {
            NAME: "WGS_1984",
            SPHEROID: ["WGS 84",6378137,298.257223563]
          },
          PRIMEM: ["Greenwich",0],
          UNIT: ["degree",0.0174532925199433]
        },
        PROJECTION: ['custom_proj4'],
        UNIT: ['Meter', 1],
        EXTENSION: ["PROJ4", "+proj=eqearth +datum=WGS84 +wktext"]
      }
    };
    var parsed = wkt_parse(str);
    assert.deepEqual(parsed, expect)
  })
})
