/* @requires pj_msfn pj_mlfn */

pj_add(pj_eqdc, 'eqdc', 'Equidistant Conic', '\n\tConic, Sph&Ell\n\tlat_1= lat_2=');

function pj_eqdc(P) {
  var phi1, phi2, n, rho, rho0, c, en, ellips, cosphi, sinphi, secant;
  var ml1, m1;
  phi1 = pj_param(P.params, "rlat_1");
  phi2 = pj_param(P.params, "rlat_2");
  if (fabs(phi1 + phi2) < EPS10) e_error(-21);
  if (!(en = pj_enfn(P.es)))
      e_error_0();
  n = sinphi = sin(phi1);
  cosphi = cos(phi1);
  secant = fabs(phi1 - phi2) >= EPS10;
  if ((ellips = (P.es > 0)) ) {
    m1 = pj_msfn(sinphi, cosphi, P.es);
    ml1 = pj_mlfn(phi1, sinphi, cosphi, en);
    if (secant) { /* secant cone */
      sinphi = sin(phi2);
      cosphi = cos(phi2);
      n = (m1 - pj_msfn(sinphi, cosphi, P.es)) /
          (pj_mlfn(phi2, sinphi, cosphi, en) - ml1);
    }
    c = ml1 + m1 / n;
    rho0 = c - pj_mlfn(P.phi0, sin(P.phi0),
      cos(P.phi0), en);
  } else {
    if (secant)
       n = (cosphi - cos(phi2)) / (phi2 - phi1);
    c = phi1 + cos(phi1) / n;
    rho0 = c - P.phi0;
  }

  P.fwd = e_fwd;
  P.inv = e_inv;

  function e_fwd(lp, xy) {
    rho = c - (ellips ? pj_mlfn(lp.phi, sin(lp.phi),
        cos(lp.phi), en) : lp.phi);
    xy.x = rho * sin( lp.lam *= n );
    xy.y = rho0 - rho * cos(lp.lam);
  }

  function e_inv(xy, lp) {
    if ((rho = hypot(xy.x, xy.y = rho0 - xy.y)) != 0.0 ) {
      if (n < 0) {
        rho = -rho;
        xy.x = -xy.x;
        xy.y = -xy.y;
      }
      lp.phi = c - rho;
      if (ellips)
        lp.phi = pj_inv_mlfn(lp.phi, P.es, en);
      lp.lam = atan2(xy.x, xy.y) / n;
    } else {
      lp.lam = 0;
      lp.phi = n > 0 ? M_HALFPI : -M_HALFPI;
    }
  }
}
