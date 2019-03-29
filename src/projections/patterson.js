pj_add(pj_patterson, 'patterson', 'Patterson Cylindrical', '\n\tCyl., Sph.');

function pj_patterson(P) {
  var K1 = 1.0148,
    K2 = 0.23185,
    K3 = -0.14499,
    K4 = 0.02406,
    C1 = K1,
    C2 = (5.0 * K2),
    C3 = (7.0 * K3),
    C4 = (9.0 * K4),
    EPS = 1e-11,
    MAX_Y =  908571831.7;

  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    var phi2 = lp.phi * lp.phi;
    xy.x = lp.lam;
    xy.y = lp.phi * (K1 + phi2 * phi2 * (K2 + phi2 * (K3 + K4 * phi2)));
  }

  function s_inv(xy, lp) {
    var MAX_ITER = 100;
    var yc, tol, y2, f, fder;
    var i;

    yc = xy.y;

    /* make sure y is inside valid range */
    if (xy.y > MAX_Y) {
      xy.y = MAX_Y;
    } else if (xy.y < -MAX_Y) {
      xy.y = -MAX_Y;
    }

    for (i = MAX_ITER; i ; --i) { /* Newton-Raphson */
      y2 = yc * yc;
      f = (yc * (K1 + y2 * y2 * (K2 + y2 * (K3 + K4 * y2)))) - xy.y;
      fder = C1 + y2 * y2 * (C2 + y2 * (C3 + C4 * y2));
      yc -= tol = f / fder;
      if (fabs(tol) < EPS) {
        break;
      }
    }
    // other projections don't error if non-convergent
    // if (i === 0) error(PJD_ERR_NON_CONVERGENT);
    lp.phi = yc;

    /* longitude */
    lp.lam = xy.x;
  }
}
