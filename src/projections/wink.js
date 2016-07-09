
pj_add(pj_wink1, 'wink1', 'Winkel I', '\n\tPCyl., Sph.\n\tlat_ts=');
pj_add(pj_wink2, 'wink2', 'Winkel II', '\n\tPCyl., Sph., no inv.\n\tlat_1=');

function pj_wink1(P) {
  var cosphi1 = cos(pj_param(P.params, "rlat_ts"));
  P.fwd = s_fwd;
  P.inv = s_inv;
  P.es = 0;

  function s_fwd(lp, xy) {
    xy.x = 0.5 * lp.lam * (cosphi1 + cos(lp.phi));
    xy.y = lp.phi;
  }

  function s_inv(xy, lp) {
    lp.phi = xy.y;
    lp.lam = 2 * xy.x / (cosphi1 + cos(lp.phi));
  }
}

function pj_wink2(P) {
  var cosphi1 = cos(pj_param(P.params, "rlat_1"));
  var MAX_ITER = 10,
      LOOP_TOL = 1e-7;
  P.fwd = s_fwd;
  P.inv = null;
  P.es = 0;

  function s_fwd(lp, xy) {
    var k, V, i, phi = lp.phi;
    xy.y = phi * M_TWO_D_PI;
    k = M_PI * sin(phi);
    phi *= 1.8;
    for (i = MAX_ITER; i ; --i) {
      phi -= V = (phi + sin (phi) - k) /
        (1 + cos(phi));
      if (fabs(V) < LOOP_TOL)
        break;
    }
    if (!i)
      phi = (phi < 0) ? -M_HALFPI : M_HALFPI;
    else
      phi *= 0.5;
    xy.x = 0.5 * lp.lam * (cos(phi) + cosphi1);
    xy.y = M_FORTPI * (sin(phi) + xy.y);
  }
}
