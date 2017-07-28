var assert = require('assert'),
    proj = require('../')

function expect(initStr, expected) {
  it (initStr, function() {
    var o = proj.internal.pj_read_init_opts(initStr);
    assert.strictEqual(o.opts, expected);
  });
}

describe('mproj_insert_libcache() pj_read_opts()', function () {
  it('add a library as a string and read a definition from it', function () {
    var str = '# ED50(ED77)\n<4154> +proj=longlat +ellps=intl +towgs84=-117,-132,-164,0,0,0,0 +no_defs  <>';
    proj.internal.mproj_insert_libcache('test', str);
    assert(proj.internal.mproj_search_libcache('test') == str);
    assert(proj.internal.mproj_search_libcache('missing') === null);
    assert.deepEqual(proj.internal.pj_read_init_opts('test:4154'), {
      opts: '+proj=longlat +ellps=intl +towgs84=-117,-132,-164,0,0,0,0 +no_defs',
      comment: 'ED50(ED77)'
    });
  })
})

describe('pj_open_lib.js pj_read_opts()', function () {
  expect('esri:2000', '+proj=tmerc +lat_0=0 +lon_0=-62 +k=0.999500 +x_0=400000 +y_0=0 +ellps=clrk80 +units=m +no_defs');
  expect('nad27:101', '+proj=tmerc +datum=NAD27 +lon_0=-85d50 +lat_0=30d30 +k=.99996 +x_0=152400.3048006096 +y_0=0 +no_defs');
  expect('epsg:2222', '+proj=tmerc +lat_0=31 +lon_0=-110.1666666666667 +k=0.9999 +x_0=213360 +y_0=0 +datum=NAD83 +units=ft +no_defs');
  expect('IGNF:AMST63', '+title=Ile d\'Amsterdam 1963 +proj=geocent +towgs84=109.7530,-528.1330,-362.2440 +a=6378388.0000 +rf=297.0000000000000 +units=m +no_defs');
  expect('GL27:erie-etal', '+proj=omerc +ellps=clrk66 +k_0=0.9999 +lonc=78d00\'W +lat_0=44d00\'N +alpha=55d40\' +x_0=-3950000 +y_0=-3430000 +no_defs');
});
