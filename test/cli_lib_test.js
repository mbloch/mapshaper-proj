var assert = require('assert'),
    lib = require('../src/cli/cli_lib');

describe('cli_lib.js', function () {
  describe('-f formatting', function () {

    function test(fmt, val, expect) {
      it (fmt + ' ' + val + ' -> ' + expect, function() {
        var f = lib.get_dfmt(fmt);
        var str = f(val);
        assert.equal(str, expect);
      });
    }

    // type f/F
    test('%f', 200, '200.000000');
    test('%08.1F', 200.12, '000200.1');
    test('%+08.1f', 200.12, '+00200.1');
    test('%-8.1f', 200.12, '200.1   ');
    test('%-+8.1f', 200.12, '+200.1  ');
    test('%-+8.1f', -200.12, '-200.1  ');
    test('%010.1f', 123456789, '123456789.0');
    test('%011.1f', 123456789, '123456789.0');
    test('%012.1f', 123456789, '0123456789.0');
    test('%+12.1f', 123456789, '+123456789.0');
    test('%12.1f', 123456789, ' 123456789.0');

    // NAN
    test('%12.1f', NaN, 'nan');
    test('%12.1F', NaN, 'NAN');

    // type e/E
    test('%e', 0, '0.000000e+0');
    test('%E', 0, '0.000000E+0');
    test('%010.3e', -0.00023, '-02.300e-4');

  })
})
