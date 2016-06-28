var assert = require('assert'),
    api = require('../'),
    helpers = require('./helpers'),
    cs2cs = require('../bin/mcs2cs');

describe('mcs2cs', function () {

  it ('non-numeric input (fwd)', function() {
    var expect = '*\t* 0.000';
    var output = cs2cs('+proj=merc +datum=WGS84')('5dW S');
    assert.equal(output, expect);
  })

  it ('non-numeric input (inv)', function() {
    var expect = '*\t* 0.00';
    var output = cs2cs('-I +proj=merc +datum=WGS84')('40000 S');
    assert.equal(output, expect);
  })


  it ('dest +axis=wsu', function() {
    var expect = '556597.45\t553583.85 0.00';
    var output = cs2cs('+proj=longlat +datum=WGS84 +to +proj=merc +datum=WGS84 +axis=wsu')('5W 5S');
    assert.equal(output, expect);
  })

  it ('src +axis=wsu', function() {
    var expect = '556597.45\t553583.85 0.00';
    var output = cs2cs('+proj=longlat +datum=WGS84 +axis=wsu +to +proj=merc +datum=WGS84')('5W 5S');
    assert.equal(output, expect);
  })

  it ('No dest defn', function() {
    var expect = '-556597.45\t-553583.85 0.00';
    var output = cs2cs('-I +proj=merc +datum=WGS84')('5W 5S');
    assert.equal(output, expect);
  })

  it ('-f %.6f', function() {
    var expect = '-556597.453966\t-553583.846816 0.000000';
    var output = cs2cs('-f %.6f +proj=longlat +datum=WGS84 +to +proj=merc +datum=WGS84')('5W 5S');
    assert.equal(output, expect);
  })

  it ('-Es', function() {
    var output = cs2cs('-Es +proj=longlat +datum=WGS84 +to +proj=merc +datum=WGS84')('5W 5N');
    var expect = '5W 5N\t553583.85\t-556597.45 0.00';
    assert.equal(output, expect);
  })

  it ('-Er', function() {
    var output = cs2cs('-Er +proj=longlat +datum=WGS84 +to +proj=merc +datum=WGS84')('5N 5E');
    var expect = '5N 5E\t556597.45\t553583.85 0.00';
    assert.equal(output, expect);
  })

});
