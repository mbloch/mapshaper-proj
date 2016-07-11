var assert = require('assert'),
    read_opts = require('../').internal.pj_read_opts;

function expect(initStr, expected) {
  it (initStr, function() {
    var parts = initStr.split(':');
    assert.strictEqual(read_opts('nad/' + parts[0], parts[1]), expected);
  });
}

describe('pj_open_lib.js pj_read_opts()', function () {
  expect('esri:2000', '+proj=tmerc +lat_0=0 +lon_0=-62 +k=0.999500 +x_0=400000 +y_0=0 +ellps=clrk80 +units=m +no_defs +no_defs');
  expect('nad27:101', '+proj=tmerc +datum=NAD27 +lon_0=-85d50 +lat_0=30d30 +k=.99996 +x_0=152400.3048006096 +y_0=0 +no_defs');
  expect('epsg:2222', '+proj=tmerc +lat_0=31 +lon_0=-110.1666666666667 +k=0.9999 +x_0=213360 +y_0=0 +datum=NAD83 +units=ft +no_defs');
  expect('IGNF:AMST63', '+title=Ile d\'Amsterdam 1963 +proj=geocent +towgs84=109.7530,-528.1330,-362.2440 +a=6378388.0000 +rf=297.0000000000000 +units=m +no_defs');
  expect('GL27:erie-etal', '+proj=omerc +ellps=clrk66 +k_0=0.9999 +lonc=78d00\'W +lat_0=44d00\'N +alpha=55d40\' +x_0=-3950000 +y_0=-3430000 +no_defs');
});
