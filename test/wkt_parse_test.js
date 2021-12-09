var assert = require('assert'),
    api = require('../'),
    wkt_parse = api.internal.wkt_parse,
    fs = require('fs');

describe('wkt_parse.js', function() {

  it('wgs84 esri', function() {
    var str = fs.readFileSync('test/prj/wgs84_esri.prj', 'utf8');
    var expect = {
      GEOGCS: {
        NAME: "GCS_WGS_1984",
        DATUM: {
          NAME: "D_WGS_1984",
          SPHEROID: ["WGS_1984",6378137,298.257223563]
        },
        PRIMEM: ["Greenwich",0],
        UNIT: ["Degree",0.017453292519943295]
      }
    };
    assert.deepEqual(wkt_parse(str), expect);
  })

  it('utm 18N', function() {
    var str = fs.readFileSync('test/prj/utm_18N_esri.prj', 'utf8');
    var expect = {
      PROJCS: {
        NAME: "WGS_1984_UTM_Zone_18N",
        GEOGCS: {
          NAME: "GCS_WGS_1984",
          DATUM: {
            NAME: "D_WGS_1984",
            SPHEROID: ["WGS_1984",6378137,298.257223563]
          },
          PRIMEM: ["Greenwich",0],
          UNIT: ["Degree",0.0174532925199433]
        },
        PROJECTION: ['Transverse_Mercator'],
        PARAMETER: [
          ["False_Easting", 500000],
          ["False_Northing", 0],
          ["Central_Meridian", -75],
          ["Scale_Factor", 0.9996],
          ["Latitude_Of_Origin", 0]
        ],
        UNIT: ['Meter', 1]
      }
    };
    assert.deepEqual(wkt_parse(str), expect);
  })

  it('geocentric_ogc', function() {
    var str = fs.readFileSync('test/prj/geocentric_ogc.prj', 'utf8');
    var expect = {
      GEOCCS: {
        NAME: "WGS 84",
        DATUM: {
          NAME: "World Geodetic System 1984",
          SPHEROID: ["WGS 84", 6378137.0,298.257223563, ["AUTHORITY", "EPSG", "7030"]],
          AUTHORITY: ["EPSG", "6326"]
        },
        PRIMEM: ["Greenwich", 0.0, ["AUTHORITY", "EPSG","8901"]],
        UNIT: ["m", 1.0],
        AXIS: [
          ["Geocentric X", "OTHER"],
          ["Geocentric Y", "EAST"],
          ["Geocentric Z", "NORTH"]
        ],
        AUTHORITY: ["EPSG","4978"]
      }
    }
    // console.log(JSON.stringify(wkt_parse(str))); console.log(); console.log(JSON.stringify(expect))
    assert.deepEqual(wkt_parse(str), expect);
  })
});
