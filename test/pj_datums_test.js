var assert = require('assert'),
    api = require('../');

describe('pj_datums.js', function () {
  describe('find_datum()', function () {
    it('wgs84', function () {
      var target = {
        id: 'WGS84',
        defn: 'towgs84=0,0,0',
        ellipse_id: 'WGS84',
        comments: ''
      };
      assert.deepEqual(api.internal.find_datum('WGS84'), target);
    })
  })

});
