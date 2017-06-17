/* @requires aasincos */
pj_add(pj_mbt_fps, 'mbt_fps', 'McBryde-Thomas Flat-Pole Sine (No. 2)', '\n\tCyl., Sph.');

function pj_mbt_fps(P) {
  var MAX_ITER = 10,
      LOOP_TOL = 1e-7,
      C1 = 0.45503,
      C2 = 1.36509,
      C3 = 1.41546,
      C_x = 0.22248,
      C_y = 1.44492,
      C1_2 = 1 / 3;

  P.fwd = s_fwd;
  P.inv = s_inv;
  P.es = 0;

  function s_fwd(lp, xy) {
    var k, V, t, i;
    k = C3 * sin(lp.phi);
    for (i = MAX_ITER; i; --i) {
      t = lp.phi / C2;
      lp.phi -= V = (C1 * sin(t) + sin(lp.phi) - k) /
        (C1_2 * cos(t) + cos(lp.phi));
      if (fabs(V) < LOOP_TOL)
        break;
    }
    t = lp.phi / C2;
    xy.x = C_x * lp.lam * (1 + 3 * cos(lp.phi) / cos(t));
    xy.y = C_y * sin(t);
  }

  function s_inv(xy, lp) {
    var t;
    lp.phi = C2 * (t = aasin(xy.y / C_y));
    lp.lam = xy.x / (C_x * (1 + 3 * cos(lp.phi) / cos(t)));
    lp.phi = aasin((C1 * sin(t) + sin(lp.phi)) / C3);
  }
}
