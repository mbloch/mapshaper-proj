var assert = require('assert'),
    api = require('../'),
    helpers = require('./helpers');

// a port of some of the tests in Proj.4 nad/testvarious

describe('transform tests', function () {

  // Test raw ellipse to raw ellipse
  helpers.test_cs2cs('+proj=latlong +ellps=clrk66 +to +proj=latlong +ellps=bessel')
    .values('79d58\'00.000"W 37d02\'00.000"N 0.0', '79d58\'W  37d2\'N 0.000')
    .values('79d58\'00.000"W 36d58\'00.000"N 0.0', '79d58\'W 36d58\'N 0.000')

  // Test NAD27 to raw ellipse
  // FAILS
  //helpers.test_cs2cs('+proj=latlong +datum=NAD27 +to +proj=latlong +ellps=bessel')
  //  .values('79d00\'00.000"W 35d00\'00.000"N 0.0', '79dW  35dN 0.000')

  // Between two 3parameter approximations on same ellipsoid
  helpers.test_cs2cs('+proj=latlong +ellps=bessel +towgs84=5,0,0 +to +proj=latlong +ellps=bessel +towgs84=1,0,0', 1e-3)
    .values('0d00\'00.000"W 0d00\'00.000"N 0.0', '0dE 0dN 4.000')
    .values('79d00\'00.000"W 45d00\'00.000"N 0.0', '78d59\'59.821"W  44d59\'59.983"N 0.540')

  // Test simple prime meridian handling
  helpers.test_cs2cs('+proj=latlong +datum=WGS84 +pm=greenwich +to +proj=latlong +datum=WGS84 +pm=1', 1e-3)
    .values('0d00\'00.000"W 0d00\'00.000"N 0.0', '1dW 0dN 0.000')
    .values('79d00\'00.000"W 45d00\'00.000"N 0.0', '80dW  45dN 0.000')

  // Test support for the lon_wrap switch
  helpers.test_cs2cs('+proj=latlong +datum=WGS84 +to +proj=latlong +datum=WGS84 +lon_wrap=180', 1e-3)
    .values('1d00\'00.000"W 10d00\'00.000"N 0.0', '359dE 10dN 0.000')
    .values('0d00\'00.000"W 10d00\'00.000"N 0.0', '0dE 10dN 0.000')
    .values('0d00\'00.000"E 10d00\'00.000"N 0.0', '0dE 10dN 0.000')
    .values('1d00\'00.000"E 45d00\'00.000"N 0.0', '1dE 45dN 0.000')
    .values('179d00\'00.000"E 45d00\'00.000"N 0.0', '179dE 45dN 0.000')
    .values('181d00\'00.000"E 45d00\'00.000"N 0.0', '181dE 45dN 0.000')
    .values('350d00\'00.000"E 45d00\'00.000"N 0.0', '350dE 45dN 0.000')
    .values('370d00\'00.000"E 45d00\'00.000"N 0.0', '10dE  45dN 0.000')

  // Test simple prime meridian handling within a projection
  helpers.test_cs2cs('+proj=utm +zone=11 +datum=WGS84 +pm=3 +to +proj=latlong +datum=WGS84 +pm=1w', 1e-3)
    .values('500000 3000000', '113dW  27d7\'20.891"N 0.000')

  // Test geocentric x/y/z generation
  helpers.test_cs2cs('+proj=latlong +datum=WGS84 +to +proj=geocent +datum=WGS84', 1e-2)
    .values('0d00\'00.001"W 0d00\'00.001"N 0.0', '6378137.00  -0.03 0.03')
    .values('0d00\'00.001"W 0d00\'00.001"N 10.0', '6378147.00 -0.03 0.03')
    .values('79d00\'00.000"W 45d00\'00.000"N 0.0', '861996.98 -4434590.01 4487348.41')
    .values('45d00\'00.000"W 89d59\'59.990"N 0.0', '0.22  -0.22 6356752.31')

})
