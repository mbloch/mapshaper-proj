pj_add(pj_nell, 'nell', 'Nell', '\n\tPCyl., Sph.');

function pj_nell(P) {
  var MAX_ITER = 10;
  var LOOP_TOL = 1e-7;
  P.inv = s_inv;
  P.fwd = s_fwd;
  P.es = 0;

  function s_fwd(lp, xy) {
    var k, V, i;
    k = 2 * sin(lp.phi);
    V = lp.phi * lp.phi;
    lp.phi *= 1.00371 + V * (-0.0935382 + V * -0.011412);
    for (i = MAX_ITER; i ; --i) {
        lp.phi -= V = (lp.phi + sin(lp.phi) - k) /
            (1 + cos(lp.phi));
        if (fabs(V) < LOOP_TOL)
            break;
    }
    xy.x = 0.5 * lp.lam * (1 + cos(lp.phi));
    xy.y = lp.phi;
  }

  function s_inv(xy, lp) {
    lp.lam = 2 * xy.x / (1 + cos(xy.y));
    lp.phi = aasin(0.5 * (xy.y + sin(xy.y)));
  }
}
