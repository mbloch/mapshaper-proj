/* @requires pj_zpoly1 */

pj_add(pj_nzmg, 'nzmg', 'New Zealand Map Grid', '\n\tfixed Earth');

function pj_nzmg(P) {
  var EPSLN = 1e-10;
  var SEC5_TO_RAD = 0.4848136811095359935899141023;
  var RAD_TO_SEC5 = 2.062648062470963551564733573;
  var bf = [
    [ 0.7557853228, 0.0],
    [ 0.249204646,  0.003371507],
    [-0.001541739,  0.041058560],
    [-0.10162907,   0.01727609],
    [-0.26623489,  -0.36249218],
    [-0.6870983,   -1.1651967]];

  var tphi= [1.5627014243, 0.5185406398, -0.03333098,
    -0.1052906, -0.0368594, 0.007317, 0.01220, 0.00394, -0.0013];

  var tpsi = [0.6399175073, -0.1358797613, 0.063294409, -0.02526853, 0.0117879,
    -0.0055161, 0.0026906, -0.001333, 0.00067, -0.00034];

  /* force to International major axis */
  P.ra = 1 / (P.a = 6378388.0);
  P.lam0 = DEG_TO_RAD * 173;
  P.phi0 = DEG_TO_RAD * -41;
  P.x0 = 2510000;
  P.y0 = 6023150;

  P.inv = e_inv;
  P.fwd = e_fwd;

  function e_fwd(lp, xy) {
    var i = tpsi.length - 1;
    var p = {r: tpsi[i]};
    var phi = (lp.phi - P.phi0) * RAD_TO_SEC5;
    for (--i; i >= 0; --i)
      p.r = tpsi[i] + phi * p.r;
    p.r *= phi;
    p.i = lp.lam;
    p = pj_zpoly1(p, bf);
    xy.x = p.i;
    xy.y = p.r;
  }

  function e_inv(xy, lp) {
    var nn, i, dr, di, f, den;
    var p = {r: xy.y, i: xy.x};
    var fp = {};
    for (nn = 20; nn > 0 ;--nn) {
      f = pj_zpolyd1(p, bf, fp);
      f.r -= xy.y;
      f.i -= xy.x;
      den = fp.r * fp.r + fp.i * fp.i;
      p.r += dr = -(f.r * fp.r + f.i * fp.i) / den;
      p.i += di = -(f.i * fp.r - f.r * fp.i) / den;
      if ((fabs(dr) + fabs(di)) <= EPSLN) break;
    }
    if (nn > 0) {
      lp.lam = p.i;
      i = tphi.length - 1;
      lp.phi = tphi[i];
      for (--i; i >= 0; --i)
        lp.phi = tphi[i] + p.r * lp.phi;
      lp.phi = P.phi0 + p.r * lp.phi * SEC5_TO_RAD;
    } else
      lp.lam = lp.phi = HUGE_VAL;
  }
}
