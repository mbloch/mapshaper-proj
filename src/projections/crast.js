pj_add(pj_crast, 'crast', 'Craster Parabolic (Putnins P4)', '\n\tPCyl., Sph.');

function pj_crast(P) {
  var XM = 0.97720502380583984317;
  var RXM = 1.02332670794648848847;
  var YM = 3.06998012383946546542;
  var RYM = 0.32573500793527994772;
  var THIRD = 1/3;
  P.inv = s_inv;
  P.fwd = s_fwd;
  P.es = 0;

  function s_fwd(lp, xy) {
    lp.phi *= THIRD;
    xy.x = XM * lp.lam * (2 * cos(lp.phi + lp.phi) - 1);
    xy.y = YM * sin(lp.phi);
  }

  function s_inv(xy, lp) {
    lp.phi = 3 * asin(xy.y * RYM);
    lp.lam = xy.x * RXM / (2 * cos((lp.phi + lp.phi) * THIRD) - 1);
  }
}
