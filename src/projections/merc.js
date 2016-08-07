/* @require pj_phi2, pj_tsfn */


pj_add(pj_merc, "merc", "Mercator", "\n\tCyl, Sph&Ell\n\tlat_ts=");

function pj_merc(P) {
  var EPS10 = 1e-10;
  var phits = 0;
  var is_phits = pj_param(P.params, "tlat_ts");

  if (is_phits) {
    phits = pj_param(P.params, "rlat_ts");
    if (phits >= M_HALFPI) {
      e_error(-24);
    }
  }

  if (P.es) { // ellipsoid
    if (is_phits) {
      P.k0 = pj_msfn(sin(phits), cos(phits), P.es);
    }
    P.inv = e_inv;
    P.fwd = e_fwd;
  } else {
    P.inv = s_inv;
    P.fwd = s_fwd;
  }

  function e_fwd(lp, xy) {
    if (fabs(fabs(lp.phi) - M_HALFPI) <= EPS10) {
      f_error();
    }
    xy.x = P.k0 * lp.lam;
    xy.y = -P.k0 * log(pj_tsfn(lp.phi, sin(lp.phi), P.e));
  }

  function e_inv(xy, lp) {
    lp.phi = pj_phi2(exp(-xy.y / P.k0), P.e);
    if (lp.phi === HUGE_VAL) {
      i_error();
    }
    lp.lam = xy.x / P.k0;
  }

  function s_fwd(lp, xy) {
    if (fabs(fabs(lp.phi) - M_HALFPI) <= EPS10) {
      f_error();
    }
    xy.x = P.k0 * lp.lam;
    xy.y = P.k0 * log(tan(M_FORTPI + 0.5 * lp.phi));
  }

  function s_inv(xy, lp) {
    lp.phi = M_HALFPI - 2 * atan(exp(-xy.y / P.k0));
    lp.lam = xy.x / P.k0;
  }
}
