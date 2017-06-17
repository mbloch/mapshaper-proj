pj_add(pj_mbt_fpp, 'mbt_fpp', 'McBride-Thomas Flat-Polar Parabolic', '\n\tCyl., Sph.');

function pj_mbt_fpp(P) {
  var CS = 0.95257934441568037152,
      FXC = 0.92582009977255146156,
      FYC = 3.40168025708304504493,
      C23 = 2 / 3,
      C13 = 1 / 3,
      ONEEPS = 1.0000001;

  P.fwd = s_fwd;
  P.inv = s_inv;
  P.es = 0;

  function s_fwd(lp, xy) {
    lp.phi = asin(CS * sin(lp.phi));
    xy.x = FXC * lp.lam * (2 * cos(C23 * lp.phi) - 1);
    xy.y = FYC * sin(C13 * lp.phi);
  }

  function s_inv(xy, lp) {
    lp.phi = xy.y / FYC;
    if (fabs(lp.phi) >= 1) {
      if (fabs(lp.phi) > ONEEPS)
        i_error();
      else
        lp.phi = (lp.phi < 0) ? -M_HALFPI : M_HALFPI;
    } else
      lp.phi = asin(lp.phi);

    lp.lam = xy.x / (FXC * (2 * cos(C23 * (lp.phi *= 3)) - 1));
    if (fabs(lp.phi = sin(lp.phi) / CS) >= 1) {
      if (fabs(lp.phi) > ONEEPS)
        i_error();
      else
        lp.phi = (lp.phi < 0) ? -M_HALFPI : M_HALFPI;
    } else
      lp.phi = asin(lp.phi);
  }
}
