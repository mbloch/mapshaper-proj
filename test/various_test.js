var assert = require('assert'),
    api = require('../'),
    helpers = require('./helpers');

// a port of some of the tests in Proj.4 nad/testvarious

describe('transform tests', function () {

  // Test raw ellipse to raw ellipse
  helpers.test_cs2cs('+proj=latlong +ellps=clrk66 +to +proj=latlong +ellps=bessel')
    .values('79d58\'00.000"W 37d02\'00.000"N 0.0', '79d58\'W\t37d2\'N 0.000')
    .values('79d58\'00.000"W 36d58\'00.000"N 0.0', '79d58\'W\t36d58\'N 0.000')
  // Test NAD27 to raw ellipse
  // FAILS
  //helpers.test_cs2cs('+proj=latlong +datum=NAD27 +to +proj=latlong +ellps=bessel')
  //  .values('79d00\'00.000"W 35d00\'00.000"N 0.0', '79dW  35dN 0.000')

  // Between two 3parameter approximations on same ellipsoid
  helpers.test_cs2cs('+proj=latlong +ellps=bessel +towgs84=5,0,0 +to +proj=latlong +ellps=bessel +towgs84=1,0,0')
    .values('0d00\'00.000"W 0d00\'00.000"N 0.0', '0dE\t0dN 4.000')
    .values('79d00\'00.000"W 45d00\'00.000"N 0.0', '78d59\'59.821"W\t44d59\'59.983"N 0.540')

  // Test simple prime meridian handling
  helpers.test_cs2cs('+proj=latlong +datum=WGS84 +pm=greenwich +to +proj=latlong +datum=WGS84 +pm=1')
    .values('0d00\'00.000"W 0d00\'00.000"N 0.0', '1dW\t0dN 0.000')
    .values('79d00\'00.000"W 45d00\'00.000"N 0.0', '80dW\t45dN 0.000')

  // Test support for the lon_wrap switch
  helpers.test_cs2cs('+proj=latlong +datum=WGS84 +to +proj=latlong +datum=WGS84 +lon_wrap=180')
    .values('1d00\'00.000"W 10d00\'00.000"N 0.0', '359dE\t10dN 0.000')
    .values('0d00\'00.000"W 10d00\'00.000"N 0.0', '0dE\t10dN 0.000')
    .values('0d00\'00.000"E 10d00\'00.000"N 0.0', '0dE\t10dN 0.000')
    .values('1d00\'00.000"E 45d00\'00.000"N 0.0', '1dE\t45dN 0.000')
    .values('179d00\'00.000"E 45d00\'00.000"N 0.0', '179dE\t45dN 0.000')
    .values('181d00\'00.000"E 45d00\'00.000"N 0.0', '181dE\t45dN 0.000')
    .values('350d00\'00.000"E 45d00\'00.000"N 0.0', '350dE\t45dN 0.000')
    .values('370d00\'00.000"E 45d00\'00.000"N 0.0', '10dE\t45dN 0.000')

  // Test simple prime meridian handling within a projection
  helpers.test_cs2cs('+proj=utm +zone=11 +datum=WGS84 +pm=3 +to +proj=latlong +datum=WGS84 +pm=1w')
    .values('500000 3000000', '113dW\t27d7\'20.891"N 0.000')

  // Test geocentric x/y/z generation
  helpers.test_cs2cs('+proj=latlong +datum=WGS84 +to +proj=geocent +datum=WGS84')
    .values('0d00\'00.001"W 0d00\'00.001"N 0.0', '6378137.00\t-0.03 0.03')
    .values('0d00\'00.001"W 0d00\'00.001"N 10.0', '6378147.00\t-0.03 0.03')
    .values('79d00\'00.000"W 45d00\'00.000"N 0.0', '861996.98\t-4434590.01 4487348.41')
    .values('45d00\'00.000"W 89d59\'59.990"N 0.0', '0.22\t-0.22 6356752.31')

  // Test geocentric x/y/z consumption.
  helpers.test_cs2cs('+proj=geocent +datum=WGS84 +to +proj=latlong +datum=WGS84')
    .values('6378137.00\t-0.00 0.00', '0dE\t0dN 0.000')
    .values('6378147.00\t-0.00 0.00', '0dE\t0dN 10.000')
    .values('861996.98\t-4434590.01 4487348.41', '79dW\t45dN 0.001')
    .values('0.00\t-0.00 6356752.31', '0dE\t90dN -0.004')

  // Test stere projection (re: win32 ticket 12)
  helpers.test_cs2cs('+proj=latlong +datum=WGS84 +to +proj=stere +lat_0=90 +lon_0=0 +lat_ts=70 +datum=WGS84')
    .values('105 40', '5577808.93\t1494569.40 0.00')

  // Test stere without lat_ts (#147)
  helpers.test_cs2cs('+proj=latlong +datum=WGS84 +to +proj=stere +lat_0=40 +lon_0=10  +datum=WGS84')
    .values('20 45', '789468.08\t602385.33 0.00')

  // ...

  // Test extended transverse mercator (#97)
  helpers.test_cs2cs('+proj=etmerc +k=0.998 +lon_0=-20 +datum=WGS84 +x_0=10000 +y_0=20000 +to +proj=latlong +datum=WGS84')
    .values('10000 20000', '20dW\t0dN 0.000')
    .values('500000 2000000', '15d22\'16.108"W\t17d52\'53.478"N 0.000')
    .values('1000000 2000000', '10d40\'55.532"W\t17d42\'48.526"N 0.000')
    .values('2000000 2000000', '1d32\'21.33"W\t17d3\'47.233"N 0.000')
    .values('4000000 2000000', '15d4\'42.357"E\t14d48\'56.372"N 0.000')


  // Test extended transverse mercator inverse (#97)
  helpers.test_cs2cs('+proj=latlong +datum=WGS84 +to +proj=etmerc +k=0.998 +lon_0=-20 +datum=WGS84 +x_0=10000 +y_0=20000')
    .values('0dN 0.000', '2278817.00\t20000.00 0.00')
    .values('15d22\'16.108"W 17d52\'53.478"N 0.000', '499999.99\t2000000.01 0.00')
    .values('10d40\'55.532"W 17d42\'48.526"N 0.000', '999999.99\t1999999.99 0.00')
    .values('1d32\'21.33"W 17d3\'47.233"N 0.000', '2000000.00\t1999999.99 0.00')
    .values('15d4\'42.357"E  14d48\'56.372"N 0.000', '4000000.00\t2000000.01 0.00')

})
