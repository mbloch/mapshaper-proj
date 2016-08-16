var assert = require('assert'),
    helpers = require('./helpers'),
    api = require('../');

function test(str, val) {
  it(str, function() {
    var output = api.internal.dmstod(str);
    helpers.aboutEqual(output, val);
  });
}

describe('dmstor.js', function () {
  // examples from http://proj.maptools.org/gen_parms.html
  test('0dE', 0);
  test('9d07\'54.862"W', -9.131906111111112);
  test('12d27\'8.4"E', 12.452333333333332);
  test('12d27\'8.4E', 12.452333333333332); // omit "
  test('17d40\'s', -17.666666666666667);
  test('17d40s', -17.666666666666667); // omit '
  test('-10.03', -10.03);
  test('0.02', 0.02);
  test('0', 0);
})
