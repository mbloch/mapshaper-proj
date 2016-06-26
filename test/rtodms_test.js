var assert = require('assert'),
    helpers = require('./helpers'),
    api = require('../');

function test(f, input, target) {
  it (input + ' -> ' + target, function() {
    var r = api.internal.dmstor(input);
    var output = f(r);
    assert.equal(target, output);
  });
}

describe('rtodms.js', function () {
  describe('3 digits, fixed', function () {
    var flon = api.internal.get_rtodms(3, true, 'E', 'W');
    var flat = api.internal.get_rtodms(3, true, 'N', 'S');
    test(flon, '9d07\'54.862"W', '9d07\'54.862"W');
    test(flon, '9dW', '9dW');
    test(flat, '9d0\'0.001"S', '9d00\'0.001"S');
    test(flat, '0dN', '0dN');
  })

  describe('3 digits, not fixed', function() {
    var flon = api.internal.get_rtodms(3, false, 'E', 'W');
    var flat = api.internal.get_rtodms(3, false, 'N', 'S');
    test(flat, '9d2\'0.010"N', '9d2\'0.01"N');
  })

  describe('0 digits, fixed', function() {
    var flon = api.internal.get_rtodms(0, true, 'E', 'W');
    var flat = api.internal.get_rtodms(0, true, 'N', 'S');
    test(flat, '9d2\'0.010"N', '9d02\'N');
  })

  describe('0 digits, not fixed', function() {
    var flon = api.internal.get_rtodms(0, false, 'E', 'W');
    var flat = api.internal.get_rtodms(0, false, 'N', 'S');
    test(flat, '9d2\'0.010"N', '9d2\'N');
  })

  describe('8 digits, fixed', function() {
    var flon = api.internal.get_rtodms(8, true, 'E', 'W');
    var flat = api.internal.get_rtodms(8, true, 'N', 'S');
    test(flon, '9d2\'0.010"E', '9d02\'0.01000000"E');
  })

  describe('8 digits, not fixed', function() {
    var flon = api.internal.get_rtodms(8, false, 'E', 'W');
    var flat = api.internal.get_rtodms(8, false, 'N', 'S');
    test(flon, '9d2\'0.010"E', '9d2\'0.01"E');
  })
})
