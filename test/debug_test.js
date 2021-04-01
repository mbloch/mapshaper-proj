var assert = require('assert'),
    api = require('../'),
    helpers = require('./helpers'),
    cs2cs = require('../bin/mcs2cs'),
    proj = require('../bin/mproj');

describe('debug', function () {
  it ('-f %.6f', function() {
    var expect = '-556597.453966\t-553583.846816';
    var output = proj('-f %.6f +proj=merc +datum=WGS84')('5dW 5dS');
    // console.log(output)
    // assert.equal(output, expect);
  })
})