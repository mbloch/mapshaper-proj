pj_add(pj_natearth, 'natearth', 'Natural Earth', '\n\tPCyl., Sph.');
pj_add(pj_natearth2, 'natearth2', 'Natural Earth 2', '\n\tPCyl., Sph.');

function pj_natearth(P) {
  var A0 = 0.8707,
  A1 = -0.131979,
  A2 = -0.013791,
  A3 = 0.003971,
  A4 = -0.001529,
  B0 = 1.007226,
  B1 = 0.015085,
  B2 = -0.044475,
  B3 = 0.028874,
  B4 = -0.005916,
  C0 = B0,
  C1 = (3 * B1),
  C2 = (7 * B2),
  C3 = (9 * B3),
  C4 = (11 * B4),
  EPS = 1e-11,
  MAX_Y = (0.8707 * 0.52 * M_PI);

  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    var phi2, phi4;
    phi2 = lp.phi * lp.phi;
    phi4 = phi2 * phi2;
    xy.x = lp.lam * (A0 + phi2 * (A1 + phi2 * (A2 + phi4 * phi2 * (A3 + phi2 * A4))));
    xy.y = lp.phi * (B0 + phi2 * (B1 + phi4 * (B2 + B3 * phi2 + B4 * phi4)));
  }

  function s_inv(xy, lp) {
    var x = xy.x, y = xy.y;
    var yc, tol, y2, y4, f, fder;
    if (y > MAX_Y) {
      y = MAX_Y;
    } else if (y < -MAX_Y) {
      y = -MAX_Y;
    }

    yc = y;
      for (;;) { /* Newton-Raphson */
      y2 = yc * yc;
      y4 = y2 * y2;
      f = (yc * (B0 + y2 * (B1 + y4 * (B2 + B3 * y2 + B4 * y4)))) - y;
      fder = C0 + y2 * (C1 + y4 * (C2 + C3 * y2 + C4 * y4));
      yc -= tol = f / fder;
      if (fabs(tol) < EPS) {
          break;
      }
    }
    lp.phi = yc;
    y2 = yc * yc;
    lp.lam = x / (A0 + y2 * (A1 + y2 * (A2 + y2 * y2 * y2 * (A3 + y2 * A4))));
  }
}

function pj_natearth2(P) {
  var A0 = 0.84719,
      A1 = -0.13063,
      A2 = -0.04515,
      A3 = 0.05494,
      A4 = -0.02326,
      A5 = 0.00331,
      B0 = 1.01183,
      B1 = -0.02625,
      B2 = 0.01926,
      B3 = -0.00396,
      C0 = B0,
      C1 = (9 * B1),
      C2 = (11 * B2),
      C3 = (13 * B3),
      EPS = 1e-11,
      MAX_Y = (0.84719 * 0.535117535153096 * M_PI);

  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    var phi2, phi4, phi6;
    phi2 = lp.phi * lp.phi;
    phi4 = phi2 * phi2;
    phi6 = phi2 * phi4;
    xy.x = lp.lam * (A0 + A1 * phi2 + phi6 * phi6 * (A2 + A3 * phi2 + A4 * phi4 + A5 * phi6));
    xy.y = lp.phi * (B0 + phi4 * phi4 * (B1 + B2 * phi2 + B3 * phi4));
  }

  function s_inv(xy, lp) {
    var x = xy.x, y = xy.y;
    var yc, tol, y2, y4, y6, f, fder;
    if (y > MAX_Y) {
      y = MAX_Y;
    } else if (y < -MAX_Y) {
      y = -MAX_Y;
    }
    yc = y;
    for (;;) { /* Newton-Raphson */
      y2 = yc * yc;
      y4 = y2 * y2;
      f = (yc * (B0 + y4 * y4 * (B1 + B2 * y2 + B3 * y4))) - y;
      fder = C0 + y4 * y4 * (C1 + C2 * y2 + C3 * y4);
      yc -= tol = f / fder;
      if (fabs(tol) < EPS) {
        break;
      }
    }
    lp.phi = yc;
    y2 = yc * yc;
    y4 = y2 * y2;
    y6 = y2 * y4;
    lp.lam = x / (A0 + A1 * y2 + y6 * y6 * (A2 + A3 * y2 + A4 * y4 + A5 * y6));
  }
}
