var assert = require('assert'),
    api = require('../');

describe('pj_init.js', function () {
  describe('pj_get_params()', function () {
    function test(str, obj) {
      var params = Object.keys(obj).reduce(function(memo, key) {
        memo[key] = {used: false, param: obj[key]};
        return memo;
      }, {});
      it(str, function() {
        var params2 = api.internal.pj_get_params(str);
        assert.deepEqual(params2, params);
      });
    }

    test('+proj=merc', {proj: "merc"});
    test('+proj=tmerc +lat_0=21.16666666666667 +lon_0=-158 +k=0.99999 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs',
      {proj: "tmerc", lat_0: "21.16666666666667", lon_0: "-158", k: "0.99999",
      x_0: "500000", y_0: "0", ellps: "GRS80", units: "m", no_defs: true});
  })
})
