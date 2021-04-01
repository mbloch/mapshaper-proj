var assert = require('assert'),
    api = require('../'),
    fs = require('fs'),
    wkt_parse = api.internal.wkt_parse,
    wkt_to_proj4 = api.internal.wkt_to_proj4;

describe('WKT parsing issues', function () {

  it('Parsing UTM 55S', function() {
    var str = fs.readFileSync('test/prj/issues/papua_new_guinea.prj', 'utf8');
    var proj4 = wkt_to_proj4(str);
    assert(proj4.includes('+proj=utm +zone=55 +south +datum=WGS84'));
  });


  it('Error parsing MontVa_Supervisor_Precincts.prj', function () {
    // Error was caused by an unexpected top-level "VERTCS" definition
    var str = fs.readFileSync('test/prj/issues/MontVa_Supervisor_Precincts.prj', 'utf8');
    var obj = wkt_parse(str);
    assert.equal(typeof obj.PROJCS, 'object');
    assert.equal(typeof obj.VERTCS, 'object');
    assert.strictEqual(wkt_to_proj4(str).indexOf('+proj=lcc'), 0);
  })
})
