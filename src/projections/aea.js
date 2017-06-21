/* @require pj_qsfn pj_msfn */

pj_add(pj_aea, 'aea', 'Albers Equal Area', '\n\tConic Sph&Ell\n\tlat_1= lat_2=');
pj_add(pj_leac, 'leac', 'Lambert Equal Area Conic', '\n\tConic, Sph&Ell\n\tlat_1= south');

function pj_aea(P) {
  var phi1 = pj_param(P.params, "rlat_1");
  var phi2 = pj_param(P.params, "rlat_2");
  pj_aea_init(P, phi1, phi2);
}

function pj_leac(P) {
  var phi1 = pj_param(P.params, "rlat_1");
  var phi2 = pj_param(P.params, "bsouth") ? -M_HALFPI : M_HALFPI;
  pj_aea_init(P, phi1, phi2);
}

function pj_aea_init(P, phi1, phi2) {
  var ec, n, c, dd, n2, rho0, rho, en, ellips,
      cosphi, sinphi, secant, ml2, m2, ml1, m1;

  P.fwd = e_fwd;
  P.inv = e_inv;

  if (fabs(phi1 + phi2) < EPS10) e_error(-21);
  n = sinphi = sin(phi1);
  cosphi = cos(phi1);
  secant = fabs(phi1 - phi2) >= EPS10;
  if ((ellips = (P.es > 0))) {
    en = pj_enfn(P.es);
    m1 = pj_msfn(sinphi, cosphi, P.es);
    ml1 = pj_qsfn(sinphi, P.e, P.one_es);
    if (secant) { /* secant cone */
      sinphi = sin(phi2);
      cosphi = cos(phi2);
      m2 = pj_msfn(sinphi, cosphi, P.es);
      ml2 = pj_qsfn(sinphi, P.e, P.one_es);
      // Ignoring Proj.4 div0 check (above checks should prevent this)
      n = (m1 * m1 - m2 * m2) / (ml2 - ml1);
    }
    ec = 1 - 0.5 * P.one_es * log((1 - P.e) / (1 + P.e)) / P.e;
    c = m1 * m1 + n * ml1;
    dd = 1 / n;
    rho0 = dd * sqrt(c - n * pj_qsfn(sin(P.phi0), P.e, P.one_es));
  } else {
    if (secant) n = 0.5 * (n + sin(phi2));
    n2 = n + n;
    c = cosphi * cosphi + n2 * sinphi;
    dd = 1 / n;
    rho0 = dd * sqrt(c - n2 * sin(P.phi0));
  }

  function e_fwd(lp, xy) {
    var lam = lp.lam;
    var rho;
    if ((rho = c - (ellips ? n * pj_qsfn(sin(lp.phi),
      P.e, P.one_es) : n2 * sin(lp.phi))) < 0) f_error();
    rho = dd * sqrt(rho);
    xy.x = rho * sin(lam *= n);
    xy.y = rho0 - rho * cos(lam);
  }

  function e_inv(xy, lp) {
    var TOL7 = 1e-7,
        x = xy.x,
        y = rho0 - xy.y,
        rho = hypot(x, y);
    if (rho != 0) {
      if (n < 0) {
        rho = -rho;
        x = -x;
        y = -y;
      }
      lp.phi = rho / dd;
      if (ellips) {
        lp.phi = (c - lp.phi * lp.phi) / n;
        if (fabs(ec - fabs(lp.phi)) > TOL7) {
          if ((lp.phi = phi1_(lp.phi, P.e, P.one_es)) == HUGE_VAL)
            i_error();
        } else
          lp.phi = lp.phi < 0 ? -M_HALFPI : M_HALFPI;
      } else if (fabs(lp.phi = (c - lp.phi * lp.phi) / n2) <= 1)
        lp.phi = asin(lp.phi);
      else
        lp.phi = lp.phi < 0 ? -M_HALFPI : M_HALFPI;
      lp.lam = atan2(x, y) / n;
    } else {
      lp.lam = 0;
      lp.phi = n > 0 ? M_HALFPI : -M_HALFPI;
    }
  }

  /* determine latitude angle phi-1 */
  function phi1_(qs, Te, Tone_es) {
    var N_ITER = 15,
        EPSILON = 1e-7,
        TOL = 1e-10;
    var Phi, sinpi, cospi, con, com, dphi, i;
    Phi = asin (0.5 * qs);
    if (Te < EPSILON)
      return Phi;
    i = N_ITER;
    do {
      sinpi = sin(Phi);
      cospi = cos(Phi);
      con = Te * sinpi;
      com = 1 - con * con;
      dphi = 0.5 * com * com / cospi * (qs / Tone_es -
         sinpi / com + 0.5 / Te * log ((1 - con) / (1 + con)));
      Phi += dphi;
    } while (fabs(dphi) > TOL && --i);
    return i ? Phi : HUGE_VAL;
  }
}
