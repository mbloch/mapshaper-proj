var assert = require('assert'),
    mproj = require('../'),
    helpers = require('./helpers'),
    proj4 = require('proj4');

// Subset of test points from proj4js/test/testData.js (only those defined by proj4 strings)
var testPoints = [{code: '+proj=gnom +lat_0=90 +lon_0=0 +x_0=6300000 +y_0=6300000 +ellps=WGS84 +datum=WGS84 +units=m +no_defs',
    xy: [350577.5930806119, 4705857.070634324],
    ll: [-75,46]
  },{
    code:'+proj=stere +lat_0=-90 +lat_ts=-70 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"',
    ll:[0, -72.5],
    xy:[0, 1910008.78441421]
  },{
   /* // +datum=none triggers an error in Proj.4
    code:"+proj=sinu +lon_0=0 +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m +datum=none +no_defs",
     xy: [ 736106.55, 5893331.11 ],
      ll: [11.0, 53.0]
  },{ */
    code:'+proj=lcc +lat_1=51.16666723333333 +lat_2=49.8333339 +lat_0=90 +lon_0=4.367486666666666 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +towgs84=106.869,-52.2978,103.724,-0.33657,0.456955,-1.84218,1 +units=m +no_defs ',
    xy:[104588.196404, 193175.582367],
    ll:[3.7186701465384533,51.04642936832842]
  },{
    code:"+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs",
    ll:[-3.20078, 55.96056],
    xy:[325132.0089586496, 674822.638235305]
  },{
    code:"+proj=tmerc +lat_0=40.5 +lon_0=-110.0833333333333 +k=0.9999375 +x_0=800000.0000101599 +y_0=99999.99998983997 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs",
    ll: [-110.8, 43.5],
    xy: [2434515.870, 1422072.711]
  }];

describe('tests from proj4js (testing api compatibility)', function () {
  var assert = helpers;
  var proj4 = mproj;
  // testPoints = testPoints.slice(0, 1);
  testPoints.forEach(function(testPoint) {
    describe(testPoint.code, function() {
      var xyAcc = 2,
        llAcc = 6;
      if ('acc' in testPoint) {
        if ('xy' in testPoint.acc) {
          xyAcc = testPoint.acc.xy;
        }
        if ('ll' in testPoint.acc) {
          llAcc = testPoint.acc.ll;
        }
      }
      var xyEPSLN = Math.pow(10, - 1 * xyAcc);
      var llEPSLN = Math.pow(10, - 1 * llAcc);
      /*
      // not implemented
      describe('traditional', function() {
        it('should work with forwards', function() {
          var proj = new proj4.Proj(testPoint.code);
          var xy = proj4.transform(proj4.WGS84, proj, proj4.toPoint(testPoint.ll));
          assert.closeTo(xy.x, testPoint.xy[0], xyEPSLN, 'x is close');
          assert.closeTo(xy.y, testPoint.xy[1], xyEPSLN, 'y is close');
        });
        it('should work with backwards', function() {
          var proj = new proj4.Proj(testPoint.code);
          var ll = proj4.transform(proj, proj4.WGS84, proj4.toPoint(testPoint.xy));
          assert.closeTo(ll.x, testPoint.ll[0], llEPSLN, 'lng is close');
          assert.closeTo(ll.y, testPoint.ll[1], llEPSLN, 'lat is close');
        });
      });
      */
      describe('new method 2 param', function() {
        it('shortcut method should work with an array', function() {
          var xy = proj4(testPoint.code, testPoint.ll);
          assert.closeTo(xy[0], testPoint.xy[0], xyEPSLN, 'x is close');
          assert.closeTo(xy[1], testPoint.xy[1], xyEPSLN, 'y is close');
        });
        it('shortcut method should work with an object', function() {
          var pt = {
            x: testPoint.ll[0],
            y: testPoint.ll[1]
          };
          var xy = proj4(testPoint.code, pt);
          assert.closeTo(xy.x, testPoint.xy[0], xyEPSLN, 'x is close');
          assert.closeTo(xy.y, testPoint.xy[1], xyEPSLN, 'y is close');
        });
        it('shortcut method should work with a point object', function() {
          var pt = proj4.toPoint(testPoint.ll);
          var xy = proj4(testPoint.code, pt);
          assert.closeTo(xy.x, testPoint.xy[0], xyEPSLN, 'x is close');
          assert.closeTo(xy.y, testPoint.xy[1], xyEPSLN, 'y is close');
        });
      });
      describe('new method 3 param', function() {
        it('shortcut method should work with an array', function() {
          var xy = proj4(proj4.WGS84, testPoint.code, testPoint.ll);
          assert.closeTo(xy[0], testPoint.xy[0], xyEPSLN, 'x is close');
          assert.closeTo(xy[1], testPoint.xy[1], xyEPSLN, 'y is close');
        });
        it('shortcut method should work with an object', function() {
          var pt = {
            x: testPoint.ll[0],
            y: testPoint.ll[1]
          };
          var xy = proj4(proj4.WGS84, testPoint.code, pt);
          assert.closeTo(xy.x, testPoint.xy[0], xyEPSLN, 'x is close');
          assert.closeTo(xy.y, testPoint.xy[1], xyEPSLN, 'y is close');
        });
        it('shortcut method should work with a point object', function() {
          var pt = proj4.toPoint(testPoint.ll);
          var xy = proj4(proj4.WGS84, testPoint.code, pt);
          assert.closeTo(xy.x, testPoint.xy[0], xyEPSLN, 'x is close');
          assert.closeTo(xy.y, testPoint.xy[1], xyEPSLN, 'y is close');
        });
      });
      describe('new method 3 param other way', function() {
        it('shortcut method should work with an array', function() {
          var ll = proj4(testPoint.code, proj4.WGS84, testPoint.xy);
          assert.closeTo(ll[0], testPoint.ll[0], llEPSLN, 'x is close');
          assert.closeTo(ll[1], testPoint.ll[1], llEPSLN, 'y is close');
        });
        it('shortcut method should work with an object', function() {
          var pt = {
            x: testPoint.xy[0],
            y: testPoint.xy[1]
          };
          var ll = proj4(testPoint.code, proj4.WGS84, pt);
          assert.closeTo(ll.x, testPoint.ll[0], llEPSLN, 'x is close');
          assert.closeTo(ll.y, testPoint.ll[1], llEPSLN, 'y is close');
        });
        it('shortcut method should work with a point object', function() {
          var pt = proj4.toPoint(testPoint.xy);
          var ll = proj4(testPoint.code, proj4.WGS84, pt);
          assert.closeTo(ll.x, testPoint.ll[0], llEPSLN, 'x is close');
          assert.closeTo(ll.y, testPoint.ll[1], llEPSLN, 'y is close');
        });
      });
      describe('1 param', function() {
        it('forwards', function() {
          var xy = proj4(testPoint.code).forward(testPoint.ll);
          assert.closeTo(xy[0], testPoint.xy[0], xyEPSLN, 'x is close');
          assert.closeTo(xy[1], testPoint.xy[1], xyEPSLN, 'y is close');
        });
        it('inverse', function() {
          var ll = proj4(testPoint.code).inverse(testPoint.xy);
          assert.closeTo(ll[0], testPoint.ll[0], llEPSLN, 'x is close');
          assert.closeTo(ll[1], testPoint.ll[1], llEPSLN, 'y is close');
        });
      });
      /*
      // not implemented
      describe('proj object', function() {
        it('should work with a 2 element array', function() {
          var xy = proj4(new proj4.Proj(testPoint.code), testPoint.ll);
          assert.closeTo(xy[0], testPoint.xy[0], xyEPSLN, 'x is close');
          assert.closeTo(xy[1], testPoint.xy[1], xyEPSLN, 'y is close');
        });
        it('should work on element', function() {
          var xy = proj4(new proj4.Proj(testPoint.code)).forward(testPoint.ll);
          assert.closeTo(xy[0], testPoint.xy[0], xyEPSLN, 'x is close');
          assert.closeTo(xy[1], testPoint.xy[1], xyEPSLN, 'y is close');
        });
        it('should work 3 element ponit object', function() {
          var pt = proj4.toPoint(testPoint.xy);
          var ll = proj4(new proj4.Proj(testPoint.code), proj4.WGS84, pt);
          assert.closeTo(ll.x, testPoint.ll[0], llEPSLN, 'x is close');
          assert.closeTo(ll.y, testPoint.ll[1], llEPSLN, 'y is close');
        });
      });
      */
    });
  });
});
