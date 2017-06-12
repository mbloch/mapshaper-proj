pj_add(pj_boggs, 'boggs', 'Boggs Eumorphic', '\n\tPCyl., no inv., Sph.');

function pj_boggs(P) {
  var NITER = 20,
      EPS = 1e-7,
      ONETOL = 1.000001,
      M_SQRT2 = sqrt(2),
      FXC = 2.00276,
      FXC2 = 1.11072,
      FYC = 0.49931;
  P.fwd = s_fwd;
  P.es = 0;

  function s_fwd(lp, xy) {
    var theta, th1, c, i;
    theta = lp.phi;
    if (fabs(fabs(lp.phi) - M_HALFPI) < EPS)
      xy.x = 0;
    else {
      c = sin(theta) * M_PI;
      for (i = NITER; i; --i) {
        theta -= th1 = (theta + sin(theta) - c) /
          (1 + cos(theta));
        if (fabs(th1) < EPS) break;
      }
      theta *= 0.5;
      xy.x = FXC * lp.lam / (1 / cos(lp.phi) + FXC2 / cos(theta));
    }
    xy.y = FYC * (lp.phi + M_SQRT2 * sin(theta));
  }
}
