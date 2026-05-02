// Prototype integration harness for WKT2 support.
//
// Runs three matrices:
//
//   1. wkt2_to_proj4:   test/wkt2/epsg/*.wkt2   ->  proj4_expected
//   2. wkt2_from_proj4 + wkt2_to_proj4 round-trip (via expected proj4)
//   3. wkt_to_proj4 fixtures (test/prj/*.prj)   ->  proj4 -> wkt2_from_proj4
//      -> wkt2_to_proj4  ->  proj4 (compare to input)
//
// NOT a pass/fail mocha test yet - this is a harness for iterating on the
// prototype. Run with: node test/wkt2_prototype_test.js

var fs = require('fs');
var path = require('path');
var api = require('..');

var expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'wkt2/expected.json'), 'utf8'));

var tallies = {};
function record(matrix, status, detail) {
  if (!tallies[matrix]) tallies[matrix] = {pass: 0, fail: 0, skip: 0, failures: []};
  tallies[matrix][status]++;
  if (status !== 'pass' && detail) tallies[matrix].failures.push(detail);
}

function normalizeProj4(s) {
  if (s == null) return '';
  return s.split(/\s+/).filter(function(t) {
    if (!t || t === '+type=crs' || t === '+no_defs') return false;
    // Drop all-zero +towgs84 (no-op)
    if (/^\+towgs84=0(,0)+$/.test(t)) return false;
    // Drop +lat_ts=0 (same as default for merc/eqc/stere)
    if (t === '+lat_ts=0') return false;
    return true;
  }).sort().join(' ');
}

// ===== Matrix 1: WKT2 -> Proj4 (existing) =====================================

function runMatrix1() {
  console.log('\n=== Matrix 1: WKT2 -> Proj4 ===');
  Object.keys(expected.epsg).sort().forEach(function(key) {
    var entry = expected.epsg[key];
    var file = path.join(__dirname, 'wkt2/epsg', key + '.wkt2');
    if (!fs.existsSync(file)) { record('m1', 'skip'); return; }
    var wkt = fs.readFileSync(file, 'utf8');
    var got;
    try { got = api.internal.wkt2_to_proj4(wkt); }
    catch (e) {
      record('m1', 'fail', key + '   ERROR: ' + e.message);
      return;
    }
    if (entry.proj4_expected == null) { record('m1', 'skip'); return; }
    if (normalizeProj4(got) === normalizeProj4(entry.proj4_expected)) {
      record('m1', 'pass');
    } else {
      record('m1', 'fail', key +
        '\n    got:      ' + got +
        '\n    expected: ' + entry.proj4_expected);
    }
  });
  Object.keys(expected.unsupported).sort().forEach(function(key) {
    var entry = expected.unsupported[key];
    // locate file: key may be prefix of the filename (e.g. "5555_compound")
    var dir = path.join(__dirname, 'wkt2/unsupported');
    var file = path.join(dir, key + '.wkt2');
    if (!fs.existsSync(file)) {
      var alt = fs.readdirSync(dir).filter(function(f) {
        return f.indexOf(key) === 0 && f.endsWith('.wkt2');
      })[0];
      if (!alt) { record('m1', 'skip'); return; }
      file = path.join(dir, alt);
    }
    var wkt = fs.readFileSync(file, 'utf8');
    if (entry.proj4_expected) {
      try {
        var got2 = api.internal.wkt2_to_proj4(wkt);
        if (normalizeProj4(got2) === normalizeProj4(entry.proj4_expected)) {
          record('m1', 'pass');
        } else {
          record('m1', 'fail', key +
            '\n    got:      ' + got2 +
            '\n    expected: ' + entry.proj4_expected);
        }
      } catch (e2) {
        record('m1', 'fail', key + '   ERROR: ' + e2.message);
      }
      return;
    }
    try {
      var got = api.internal.wkt2_to_proj4(wkt);
      record('m1', 'fail', key + ' expected error but got ' + got);
    } catch (e) {
      if (entry.expected_error && e.message.indexOf(entry.expected_error.split(' ')[0]) > -1) {
        record('m1', 'pass');
      } else {
        record('m1', 'fail', key + ' wrong error: ' + e.message);
      }
    }
  });
}

// ===== Matrix 2: Proj4 -> WKT2 -> Proj4 (new) =================================
//
// For each EPSG fixture with a proj4_expected, take that expected Proj4, run it
// through wkt2_from_proj4 to produce WKT2, then wkt2_to_proj4 to produce a
// Proj4 string. Compare to the input Proj4 (after normalization).

function runMatrix2() {
  console.log('\n=== Matrix 2: Proj4 -> WKT2 -> Proj4 round-trip ===');
  Object.keys(expected.epsg).sort().forEach(function(key) {
    var entry = expected.epsg[key];
    if (!entry.proj4_expected) { record('m2', 'skip'); return; }
    var p4 = entry.proj4_expected;
    var wkt2, rt;
    try {
      wkt2 = api.internal.wkt2_from_proj4(p4);
      rt = api.internal.wkt2_to_proj4(wkt2);
    } catch (e) {
      record('m2', 'fail', key + '   ERROR: ' + e.message + '\n      input: ' + p4);
      return;
    }
    if (normalizeProj4(rt) === normalizeProj4(p4)) {
      record('m2', 'pass');
    } else {
      record('m2', 'fail', key +
        '\n    input:    ' + p4 +
        '\n    roundtrip:' + rt);
    }
  });
}

// ===== Matrix 3: test/prj/*.prj  ->  Proj4  ->  WKT2  ->  Proj4 ===============
//
// Use the existing WKT1 prj fixtures (which have known-good Proj4 equivalents
// via wkt_to_proj4), then roundtrip through the new WKT2 pipeline.

function runMatrix3() {
  console.log('\n=== Matrix 3: WKT1 prj -> Proj4 -> WKT2 -> Proj4 ===');
  var prjDir = path.join(__dirname, 'prj');
  if (!fs.existsSync(prjDir)) {
    console.log('(no test/prj directory; skipping)');
    return;
  }
  var files = fs.readdirSync(prjDir).filter(function(f) { return /\.prj$/i.test(f); });
  files.sort();
  files.forEach(function(file) {
    var prjText = fs.readFileSync(path.join(prjDir, file), 'utf8');
    var baseProj4;
    try { baseProj4 = api.internal.wkt_to_proj4(prjText); }
    catch (e) { record('m3', 'skip'); return; }
    var wkt2, rt;
    try {
      wkt2 = api.internal.wkt2_from_proj4(baseProj4);
      rt = api.internal.wkt2_to_proj4(wkt2);
    } catch (e) {
      record('m3', 'fail', file + '   ERROR: ' + e.message + '\n      base: ' + baseProj4);
      return;
    }
    if (normalizeProj4(rt) === normalizeProj4(baseProj4)) {
      record('m3', 'pass');
    } else {
      record('m3', 'fail', file +
        '\n    base:     ' + baseProj4 +
        '\n    roundtrip:' + rt);
    }
  });
}

runMatrix1();
runMatrix2();
runMatrix3();

console.log('\n=== Summary ===');
['m1', 'm2', 'm3'].forEach(function(m) {
  var t = tallies[m] || {pass: 0, fail: 0, skip: 0, failures: []};
  console.log(m + ': ' + t.pass + ' pass, ' + t.fail + ' fail, ' + t.skip + ' skip');
  if (t.failures && t.failures.length) {
    t.failures.forEach(function(f) { console.log('  - ' + f); });
  }
});
