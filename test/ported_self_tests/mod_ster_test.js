var assert = require('assert'),
    api = require('../../'),
    helpers = require('../helpers');

describe('mod_ster.js', function () {

  describe('mil_os', function () {
    var fwd_in = [
        [ 2, 1],
        [ 2,-1],
        [-2, 1],
        [-2,-1]
    ];

    var inv_in = [
       [ 200, 100],
       [ 200,-100],
       [-200, 100],
       [-200,-100]
    ];

    var s_fwd_expect = [
      [-1908527.94959420455, -1726237.4730614475],
      [-1916673.02291848511, -1943133.88812552323],
      [-2344429.41208962305, -1706258.05121891224],
      [-2354637.83553299867, -1926468.60513541684]
    ];

    var s_inv_expect = [
      [20.0020363939492398, 18.0009683469140498],
      [20.0020363715837419, 17.999031631815086],
      [19.9979636060507602, 18.0009683469140498],
      [19.9979636284162581, 17.999031631815086]
    ];


    var sargs = "+proj=mil_os   +R=6400000    +lat_1=0.5 +lat_2=2";

    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
    helpers.inv_test(sargs, inv_in, s_inv_expect);
  })


  describe('lee_os', function () {
    var fwd_in = [
        [ 2, 1],
        [ 2,-1],
        [-2, 1],
        [-2,-1]
    ];

    var inv_in = [
       [ 200, 100],
       [ 200,-100],
       [-200, 100],
       [-200,-100]
    ];

    var s_fwd_expect = [
      [-25564478.9526050538, 154490848.8286255],
      [ 30115393.9385746419, 125193997.439701974],
      [-31039340.5921660066,  57678685.0448915437],
      [-3088419.93942357088,  58150091.0991110131]
    ];

    var s_inv_expect = [
      [-164.997479457813824,  -9.99875886103541411],
      [-164.997479438558884, -10.0012411200022751],
      [-165.002520542186289,  -9.99875886103545142],
      [-165.002520561440946, -10.0012411200022999]
    ];

    var sargs = "+proj=lee_os   +a=6400000    +lat_1=0.5 +lat_2=2 +n=0.5";

    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
    helpers.inv_test(sargs, inv_in, s_inv_expect);
  })

  describe('gs48', function () {

    var fwd_in = [
      [ -119.0, 40.0],
      [  -70.0, 64.0],
      [  -80.0, 25.0],
      [  -95.0, 35.0]
    ];

    var inv_in = [
      [ -1923000.0,   355000.0],
      [  1354000.0,  3040000.0],
      [  1625000.0, -1413000.0],
      [    90000.0,  -439000.0]
    ];

    var s_fwd_expect = [
      [ -1923908.446529345820,   355874.658944479190],
      [  1354020.375109298155,  3040846.007866524626],
      [  1625139.160484319553, -1413614.894029108109],
      [    90241.658071457961,  -439595.048485902138]
    ];

    var s_inv_expect = [
      [-118.987112613284, 39.994449789388],
      [ -70.005208999424, 63.993387835525],
      [ -80.000346610440, 25.005602546594],
      [ -95.002606473071, 35.005424705030]
    ];

    var sargs = "+proj=gs48 +R=6370997";

    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
    helpers.inv_test(sargs, inv_in, s_inv_expect);
  })


  describe('alsk', function () {

    var fwd_in = [
      [-160.0, 55.0],
      [-160.0, 70.0],
      [-145.0, 70.0],
      [-145.0, 60.0]
    ];

    var inv_in = [
      [-500000.0, -950000.0],
      [-305000.0,  700000.0],
      [ 250000.0,  700000.0],
      [ 400000.0, -400000.0]
    ];

    var s_fwd_expect = [
      [-511510.319410844070, -967150.991676078060],
      [-303744.771290368980,  685439.745941123230],
      [265354.974019662940,   681386.892874573010],
      [387711.995394026630,  -422980.685505462640]
    ];

    var s_inv_expect = [
      [-159.854014457557, 55.165653849074],
      [-160.082332371601, 70.128307617632],
      [-145.347827407243, 70.181566919011],
      [-144.734239827146, 60.193564732505]
    ];

    var e_fwd_expect = [
      [-513253.146950842060, -968928.031867943470],
      [-305001.133897637190,  687494.464958650530],
      [266454.305088600490,   683423.477493030950],
      [389141.322439243960,  -423913.251230396680]
    ];

    var e_inv_expect = [
      [-159.830804302926, 55.183195262220],
      [-160.042203155537, 70.111086864056],
      [-145.381043551466, 70.163900908411],
      [-144.758985461448, 60.202929200739]
    ];

    var sargs = "+proj=alsk +R=6370997";
    var eargs = "+proj=alsk +ellps=clrk66";

    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
    helpers.inv_test(sargs, inv_in, s_inv_expect);
    helpers.fwd_test(eargs, fwd_in, e_fwd_expect);
    helpers.inv_test(eargs, inv_in, e_inv_expect);
  })



  describe('gs50', function () {
    var fwd_in = [
      [-160.0, 65.0],
      [-130.0, 45.0],
      [ -65.0, 45.0],
      [ -80.0, 36.0]
    ];

    var inv_in = [
      [-1800000.0, 2600000.0],
      [ -800000.0,  500000.0],
      [ 4000000.0, 1300000.0],
      [ 3900000.0, -170000.0]
    ];

    var s_fwd_expect = [
      [-1867268.2534600089,   2656506.230401823300],
      [ -769572.18967299373,    48324.312440863941],
      [ 4019393.068680791200, 1320191.309350289200],
      [ 3442685.615172345700, -178760.423489428680]
    ];

    var s_inv_expect = [
      [-158.163295044933, 64.854288364994],
      [-131.206816959506, 49.082915350974],
      [ -65.348945220767, 44.957292681774],
      [ -75.446820242089, 34.185406225616]
    ];

    var e_fwd_expect = [
      [-1874628.5377402329,   2660907.942291015300],
      [ -771831.51885333552,    48465.166491304852],
      [ 4030931.8339815089,   1323687.864777399200],
      [ 3450764.2615361013,   -175619.041820732440]
    ];

    var e_inv_expect = [
      [-157.989284999679, 64.851559609698],
      [-131.171390466814, 49.084969745967],
      [ -65.491568685301, 44.992837923774],
      [ -75.550660091101, 34.191114075743]
    ];

    var sargs = "+proj=gs50 +R=6370997";
    var eargs = "+proj=gs50 +ellps=clrk66";

    helpers.fwd_test(sargs, fwd_in, s_fwd_expect);
    helpers.inv_test(sargs, inv_in, s_inv_expect);
    helpers.fwd_test(eargs, fwd_in, e_fwd_expect);
    helpers.inv_test(eargs, inv_in, e_inv_expect);
  })

});
