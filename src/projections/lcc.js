/* @requires pj_msfn, pj_tsfn */

pj_add(pj_lcc, 'lcc', 'Lambert Conformal Conic', '\n\tConic, Sph&Ell\n\tlat_1= and lat_2= or lat_0=');

function pj_lcc(P) {
  var EPS10 = 1e-10;
  var cosphi, sinphi, secant;
  var phi1, phi2, n, rho0, c, ellips, ml1, m1;

  P.inv = e_inv;
  P.fwd = e_fwd;

  phi1 = pj_param(P.params, "rlat_1");
  if (pj_param(P.params, "tlat_2"))
    phi2 = pj_param(P.params, "rlat_2");
  else {
    phi2 = phi1;
    if (!pj_param(P.params, "tlat_0"))
      P.phi0 = phi1;
  }
  if (fabs(phi1 + phi2) < EPS10) e_error(-21);
  n = sinphi = sin(phi1);
  cosphi = cos(phi1);
  secant = fabs(phi1 - phi2) >= EPS10;
  if ((ellips = (P.es != 0))) {
    P.e = sqrt(P.es);
    m1 = pj_msfn(sinphi, cosphi, P.es);
    ml1 = pj_tsfn(phi1, sinphi, P.e);
    if (secant) { /* secant cone */
      sinphi = sin(phi2);
      n = log(m1 / pj_msfn(sinphi, cos(phi2), P.es));
      n /= log(ml1 / pj_tsfn(phi2, sinphi, P.e));
    }
    c = (rho0 = m1 * pow(ml1, -n) / n);
    rho0 *= (fabs(fabs(P.phi0) - M_HALFPI) < EPS10) ? 0 :
        pow(pj_tsfn(P.phi0, sin(P.phi0), P.e), n);
  } else {
    if (secant)
      n = log(cosphi / cos(phi2)) /
          log(tan(M_FORTPI + 0.5 * phi2) /
          tan(M_FORTPI + 0.5 * phi1));
    c = cosphi * pow(tan(M_FORTPI + 0.5 * phi1), n) / n;
    rho0 = (fabs(fabs(P.phi0) - M_HALFPI) < EPS10) ? 0 :
        c * pow(tan(M_FORTPI + 0.5 * P.phi0), -n);
  }

  function e_fwd(lp, xy) {
    var lam = lp.lam;
    var rho;
    if (fabs(fabs(lp.phi) - M_HALFPI) < EPS10) {
      if ((lp.phi * n) <= 0) f_error();
      rho = 0;
    } else {
      rho = c * (ellips ? pow(pj_tsfn(lp.phi, sin(lp.phi),
            P.e), n) : pow(tan(M_FORTPI + 0.5 * lp.phi), -n));
    }
    lam *= n;
    xy.x = P.k0 * (rho * sin(lam));
    xy.y = P.k0 * (rho0 - rho * cos(lam));
  }

  function e_inv(xy, lp) {
    var x = xy.x, y = xy.y;
    var rho;
    x /= P.k0;
    y /= P.k0;

    y = rho0 - y;
    rho = hypot(x, y);
    if (rho != 0) {
      if (n < 0) {
        rho = -rho;
        x = -x;
        y = -y;
      }
      if (ellips) {
        lp.phi = pj_phi2(pow(rho / c, 1/n), P.e);
        if (lp.phi == HUGE_VAL) i_error();
      } else
        lp.phi = 2 * atan(pow(c / rho, 1/n)) - M_HALFPI;
      lp.lam = atan2(x, y) / n;
    } else {
      lp.lam = 0;
      lp.phi = n > 0 ? M_HALFPI : -M_HALFPI;
    }
  }

}
