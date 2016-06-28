var assert = require('assert'),
    api = require('../'),
    helpers = require('./helpers'),
    proj = require('../bin/mproj');

describe('mproj', function () {

  it ('non-numeric input (fwd)', function() {
    var expect = '*\t*';
    var output = proj('+proj=merc +datum=WGS84')('5dW S');
    assert.equal(output, expect);
  })

  it ('non-numeric input (inv)', function() {
    var expect = '*\t*';
    var output = proj('-I +proj=merc +datum=WGS84')('40000 S');
    assert.equal(output, expect);
  })

  it ('-I', function() {
    var expect = '5dW\t5dS';
    var output = proj('-I +proj=merc +datum=WGS84')('-556597.45\t-553583.85');
    assert.equal(output, expect);
  })

  it ('-f %.6f', function() {
    var expect = '-556597.453966\t-553583.846816';
    var output = proj('-f %.6f +proj=merc +datum=WGS84')('5dW 5dS');
    assert.equal(output, expect);
  })

  it ('-Es', function() {
    var output = proj('-Es +proj=merc +datum=WGS84')('5dW 5dN');
    var expect = '5dW 5dN\t553583.85\t-556597.45';
    assert.equal(output, expect);
  })

  it ('-Er', function() {
    var output = proj('-Er +proj=merc +datum=WGS84')('5dN 5dE');
    var expect = '5dN 5dE\t556597.45\t553583.85';
    assert.equal(output, expect);
  })
})