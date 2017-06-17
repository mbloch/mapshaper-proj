pj_add(pj_mbt_fpq, 'mbt_fpq', 'McBryde-Thomas Flat-Polar Quartic', '\n\tCyl., Sph.');

function pj_mbt_fpq(P) {
  var NITER = 20,
      EPS = 1e-7,
      ONETOL = 1.000001,
      C = 1.70710678118654752440,
      RC = 0.58578643762690495119,
      FYC = 1.87475828462269495505,
      RYC = 0.53340209679417701685,
      FXC = 0.31245971410378249250,
      RXC = 3.20041258076506210122;

  P.fwd = s_fwd;
  P.inv = s_inv;
  P.es = 0;

  function s_fwd(lp, xy) {
    var th1, c, i;
    c = C * sin(lp.phi);
    for (i = NITER; i; --i) {
      lp.phi -= th1 = (sin(0.5 * lp.phi) + sin(lp.phi) - c) /
        (0.5 * cos(0.5 * lp.phi) + cos(lp.phi));
      if (fabs(th1) < EPS) break;
    }
    xy.x = FXC * lp.lam * (1.0 + 2 * cos(lp.phi) / cos(0.5 * lp.phi));
    xy.y = FYC * sin(0.5 * lp.phi);
  }

  function s_inv(xy, lp) {
    var t;
    lp.phi = RYC * xy.y;
    if (fabs(lp.phi) > 1) {
      if (fabs(lp.phi) > ONETOL) i_error();
      else if (lp.phi < 0) {
        t = -1;
        lp.phi = -M_PI;
      } else {
        t = 1;
        lp.phi = M_PI;
      }
    } else
      lp.phi = 2 * asin(t = lp.phi);
    lp.lam = RXC * xy.x / (1 + 2 * cos(lp.phi) / cos(0.5 * lp.phi));
    lp.phi = RC * (t + sin(lp.phi));
    if (fabs(lp.phi) > 1)
      if (fabs(lp.phi) > ONETOL) i_error();
      else
        lp.phi = lp.phi < 0 ? -M_HALFPI : M_HALFPI;
    else
      lp.phi = asin(lp.phi);
  }
}
