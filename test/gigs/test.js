var fs = require('fs'),
    path = require('path'),
    api = require('../..'),
    helpers = require('../helpers.js'),
    testDir = 'test/gigs/';

var files = [
  '5101.1-jhs.json',
  '5101.2-jhs.json',
  '5101.3-jhs.json',
  '5101.4-jhs-etmerc.json',
  // '5101.4-jhs.json', // Transverse Mercator (rev fails)
  '5102.1.json',
  // '5102.2.json',  // Lambert Conic Conformal (1SP) (fwd fails)
  '5103.1.json',
  '5103.2.json',
  '5104.json',
  // '5105.1.json', // Oblique Mercator (variant B)
  // '5105.2.json', // Oblique Mercator (variant B)
  '5106.json',
  // '5107.json',   // American Polyconic (fwd fails)
  // '5108.json',   // Cassini-Soldner (rev fails)
  '5109.json',
  '5110.json',
  '5111.1.json',
  // '5111.2.json', // Mercator (variant A)
  '5112.json',
  '5113.json',
  // '5201.json',   // Geographic Geocentric conversions (fwd fails)
  // '5203.1.json', // Position Vector 7-parameter transformation
  // '5204.1.json', // Coordinate Frame 7-parameter transformation
  // '5205.1.json', // Molodensky-Badekas 10-parameter transformation
  // '5206.json',   // NADCON
  // '5207.1.json', // NTv2
  // '5207.2.json', // NADCON
  '5208.json'
];

describe('GIGS tests', function () {
  files.forEach(function(file) {
    var json = fs.readFileSync(path.join(testDir, file), 'utf8');
    runTests(JSON.parse(json));
  });
});

function runTests(data) {
  describe(data.description, function() {
    data.tests.forEach(function(test) {
      it (test.type, function() {
        var P1 = api.pj_init(data.projections[0]);
        var P2 = api.pj_init(data.projections[1]);
        if (test.type == 'conversion') {
          runConversionTest(P1, P2, data.coordinates, test);
        } else if (test.type == 'roundtrip') {
          runRoundtripTest(P1, P2, data.coordinates, test);
        }
      });
    });
  });
}

function runConversionTest(P1, P2, coordinates, opts) {
  var tol = opts.tolerances[1];
  coordinates.forEach(function(arr) {
    var xy1 = arr[0];
    var xy2 = arr[1];
    var p = xy1.concat();
    api.pj_transform_point(P1, P2, p);
    helpers.closeToPoint(p, xy2, tol);
  });
}

function runRoundtripTest(P1, P2, coordinates, opts) {
  // TODO: repeat <opts.times> times before checking
  // TODO: check result of forward conversion as well
  var tol1 = opts.tolerances[0];
  var tol2 = opts.tolerances[1];
  coordinates.forEach(function(arr) {
    var xy1 = arr[0];
    var xy2 = arr[1];
    var p = xy1.concat();
    api.pj_transform_point(P1, P2, p);
    api.pj_transform_point(P2, P1, p);
    helpers.closeToPoint(p, xy1, tol1);
  });
}
