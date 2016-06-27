pj_add(pj_loxim, 'loxim', 'Loximuthal', '\n\tPCyl Sph');

function pj_loxim(P) {
  var EPS = 1e-8;
  var phi1, cosphi1, tanphi1;
      phi1 = pj_param(P.params, "rlat_1");
      cosphi1 = cos(phi1);
      tanphi1 = tan(M_FORTPI + 0.5 * phi1);
  if (cosphi1 < EPS) e_error(-22);
  P.fwd = s_fwd;
  P.inv = s_inv;
  P.es = 0;

  function s_fwd(lp, xy) {
    xy.y = lp.phi - phi1;
    if (fabs(xy.y) < EPS)
      xy.x = lp.lam * cosphi1;
    else {
      xy.x = M_FORTPI + 0.5 * lp.phi;
      if (fabs(xy.x) < EPS || fabs(fabs(xy.x) - M_HALFPI) < EPS)
        xy.x = 0;
      else
        xy.x = lp.lam * xy.y / log(tan(xy.x) / tanphi1);
    }
  }

  function s_inv(xy, lp) {
    lp.phi = xy.y + phi1;
    if (fabs(xy.y) < EPS) {
      lp.lam = xy.x / cosphi1;
    } else {
      lp.lam = M_FORTPI + 0.5 * lp.phi;
      if (fabs(lp.lam) < EPS || fabs(fabs(lp.lam) - M_HALFPI) < EPS)
        lp.lam = 0;
      else
        lp.lam = xy.x * log(tan(lp.lam) / tanphi1) / xy.y;
    }
  }
}
