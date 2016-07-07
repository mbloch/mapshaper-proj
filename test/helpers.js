var assert = require('assert');
var api = require('../');
var DEG_TO_RAD = api.internal.DEG_TO_RAD,
    RAD_TO_DEG = api.internal.RAD_TO_DEG;

exports.aboutEqual = function(a, b, tolerance) {
  if (!exports.isAboutEqual(a, b, tolerance)) {
    assert.equal(a, b);
  }
};

exports.closeToPoint = function(a, b, tolerance) {
  if (!exports.isAboutEqual(a[0], b[0], tolerance) ||
      !exports.isAboutEqual(a[1], b[1], tolerance)) {
    assert.deepEqual(a, b);
  }
};

// for compatibility with proj4js tests
exports.closeTo = function(a, b, tolerance, str) {
  exports.aboutEqual(a, b, tolerance);
};

exports.compareXYZ = function(a, b, tol) {
  tol = tol || 1e-12;
  if (!(exports.isAboutEqual(a.x, b.x, tol) && exports.isAboutEqual(a.y, b.y, tol) &&
      exports.isAboutEqual(a.z, b.z, tol))) {
    assert.deepEqual(a, b);
  }
};

exports.isAboutEqual = function(a, b, tolerance) {
  tolerance = tolerance || 1e-12;
  // console.log("diff:", Math.abs(a - b))
  return Math.abs(a - b) <= tolerance;
};


exports.test_cs2cs = function(str) {
  var cs2cs = require("../bin/mcs2cs");
  var test = {
    values: function(astr, bstr) {
      it (str, function() {
        var c = cs2cs(str)(astr);
        assert.equal(c, bstr);
      })
      return test;
    }
  }
  return test;
}


exports.fwd_test = function(args, lpArr, expectArr, tolerance) {
  tolerance = tolerance || 1e-7;
  it(args + ' (fwd)', function() {
    var P = api.pj_init(args);
    var p, expect, got;
    for (var i=0; i<lpArr.length; i++) {
      p = lpArr[i];
      expect = {x: expectArr[i][0], y: expectArr[i][1]};
      got = api.pj_fwd_deg({lam: p[0], phi: p[1]}, P);
      if (deviates_xy(expect, got, tolerance)) {
        assert.deepEqual(got, expect);
      }
    }
  });
};

exports.inv_test = function(args, xyArr, expectArr, tolerance) {
  tolerance = tolerance || 1e-10;
  it(args + ' (inv)', function() {
    var P = api.pj_init(args);
    var xy, expect, got;
    for (var i=0; i<xyArr.length; i++) {
      xy = xyArr[i];
      expect = {lam: expectArr[i][0], phi: expectArr[i][1]};
      got = api.pj_inv_deg({x: xy[0], y: xy[1]}, P);
      if (deviates_lp(expect, got, tolerance)) {
        assert.deepEqual(got, expect);
      }
    }
  });
};

function deviates_xy(expected, got, tolerance) {
  return expected.x != Infinity && expected.y != Infinity &&
    Math.hypot(expected.x - got.x, expected.y - got.y) <= tolerance === false;
}

function deviates_lp(expected, got, tolerance) {
  return expected.lam != Infinity && expected.phi != Infinity &&
    Math.hypot(expected.lam - got.lam, expected.phi - got.phi) <= tolerance === false;
}

function parseDMS(str) {
  var parts = str.split(/ +/);
  var x = api.internal.dmstod(parts[0]);
  var y = api.internal.dmstod(parts[1]);
  var p = {x: x, y: y};
  if (parts.length > 2) {
    p.z = parseFloat(parts[2]);
  }
  return p;
}
