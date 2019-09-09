var assert = require('assert'),
    api = require('../');

describe('pj_add.js', function () {
  it('add a passthrough function', function () {
    api.pj_add(init, 'passthrough', '', '');
    var P = api.pj_init('+proj=passthrough');
    function init(P) {
      P.fwd = function() {

      }
    }

  })

});
