var assert = require('assert'),
    mproj = require('../');

describe('api tests', function() {

  it('returns itself when module function is called with non-string arguments', function() {
    // (For compatibility with Webpack's require function)
    assert.equal(mproj(), mproj);
  })

});
