pj_add(pj_bonne, 'bonne', 'Bonne (Werner lat_1=90)', '\n\tConic Sph&Ell\n\tlat_1=');

function pj_bonne(P) {
  var EPS10 = 1e-10;
  var phi1, cphi1, am1, m1, en, c;

  phi1 = pj_param(P.params, "rlat_1");
  if (fabs(phi1) < EPS10) e_error(-23);
  if (P.es) {
    en = pj_enfn(P.es);
    m1 = pj_mlfn(phi1, am1 = sin(phi1),
      c = cos(phi1), en);
    am1 = c / (sqrt(1 - P.es * am1 * am1) * am1);
    P.inv = e_inv;
    P.fwd = e_fwd;
  } else {
    if (fabs(phi1) + EPS10 >= M_HALFPI)
      cphi1 = 0;
    else
      cphi1 = 1 / tan(phi1);
    P.inv = s_inv;
    P.fwd = s_fwd;
  }

  function e_fwd(lp, xy) {
    var rh, E, c;
    rh = am1 + m1 - pj_mlfn(lp.phi, E = sin(lp.phi), c = cos(lp.phi), en);
    E = c * lp.lam / (rh * sqrt(1 - P.es * E * E));
    xy.x = rh * sin(E);
    xy.y = am1 - rh * cos(E);
  }

  function e_inv(xy, lp) {
    var s, rh;
    rh = hypot(xy.x, xy.y = am1 - xy.y);
    lp.phi = pj_inv_mlfn(am1 + m1 - rh, P.es, en);
    if ((s = fabs(lp.phi)) < M_HALFPI) {
      s = sin(lp.phi);
      lp.lam = rh * atan2(xy.x, xy.y) * sqrt(1 - P.es * s * s) / cos(lp.phi);
    } else if (fabs(s - M_HALFPI) <= EPS10)
      lp.lam = 0;
    else i_error();
  }

  function s_fwd(lp, xy) {
    var E, rh;
    rh = cphi1 + phi1 - lp.phi;
    if (fabs(rh) > EPS10) {
      xy.x = rh * sin(E = lp.lam * cos(lp.phi) / rh);
      xy.y = cphi1 - rh * cos(E);
    } else
      xy.x = xy.y = 0;
  }

  function s_inv(xy, lp) {
    var rh = hypot(xy.x, xy.y = cphi1 - xy.y);
    lp.phi = cphi1 + phi1 - rh;
    if (fabs(lp.phi) > M_HALFPI) i_error();
    if (fabs(fabs(lp.phi) - M_HALFPI) <= EPS10)
      lp.lam = 0;
    else
      lp.lam = rh * atan2(xy.x, xy.y) / cos(lp.phi);
  }
}
