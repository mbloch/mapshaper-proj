var helpers = require('./helpers');

// Points close to the poles, the equator and the projection centres, where asin() and
// acos() of values close to 1, slowly converging iterations and subtractions of large
// terms lost digits. Expected values are from 50-digit computations on a sphere of
// radius 6400000 m. Forward within 1e-6 m, inverse within 1e-10 degrees (1e-11 for stere).
describe('precision near the poles, the equator and the centres', function () {
  // failed to initialise (sinph0 not defined)
  helpers.fwd_test('+proj=gnom +lat_0=45 +a=6400000', [[10, 60]],
    [[578493.085214822, 1760251.9389672705]], 1e-6);
  // was 0.25 m off (acos of a value close to 1)
  helpers.fwd_test('+proj=aeqd +a=6400000', [[1e-6, -2e-6]],
    [[0.11170107212763705, -0.2234021442552742]], 1e-6);
  // was 262 km off (the Newton iteration did not converge and x was set to 0)
  helpers.fwd_test('+proj=moll +a=6400000', [[170, 89.9]],
    [[261739.81548119086, 9049906.014497606]], 1e-6);
  // was 20,000 km off (two large terms subtracted)
  helpers.fwd_test('+proj=vandg +a=6400000', [[1e-6, 2e-6]],
    [[0.11170107212763708, 0.22340214425527422]], 1e-6);
  // was 7 cm off (acos of a value close to 1)
  helpers.fwd_test('+proj=wintri +a=6400000', [[1.1710159982592087e-06, 4.496557511326608e-07]],
    [[0.10703799562463405, 0.050227029489876174]], 1e-6);
  // was 2 mm off (asin of a value close to 1)
  helpers.inv_test('+proj=stere +lat_0=45 +a=6400000', [[447.5574930584751, 5300703.896968693]],
    [[19.99999999999799, 89.99]], 1e-11);
  // +M was not taken into account by the inverse (179.07, 15.31 instead of 100, 40)
  helpers.inv_test('+proj=hammer +M=2 +a=6400000', [[17390806.06423, 2381163.894185534]],
    [[99.99999999999999, 40.0]], 1e-10);

  // points on the outline (lon +/-180) must come back on their own side of the map, also
  // close to the poles, where the longitude can round slightly past +/-180
  it('moll inverse keeps the outline on its own side', function () {
    var api = require('../'), P = api.pj_init('+proj=moll +a=6400000');
    [-180, 180].forEach(function (lon) {
      [-89.9999999, -89.9, -45, 0, 61.4, 89.9, 89.99, 89.9999999].forEach(function (lat) {
        var xy = api.pj_fwd_deg({lam: lon, phi: lat}, P);
        var lp = api.pj_inv_deg(xy, P);
        if (!(Math.abs(lp.lam - lon) < 1e-6 && Math.abs(lp.phi - lat) < 1e-9)) {
          throw new Error('(' + lon + ', ' + lat + ') came back as (' + lp.lam + ', ' + lp.phi + ')');
        }
      });
    });
  });
});
