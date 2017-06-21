

function srat(esinp, exp) {
  return pow((1-esinp)/(1+esinp), exp);
}

function pj_gauss_ini(e, phi0) {
  var es = e * e,
      sphi = sin(phi0),
      cphi = cos(phi0),
      rc = sqrt(1 - es) / (1 - es * sphi * sphi),
      C = sqrt(1 + es * cphi * cphi * cphi * cphi / (1 - es)),
      // ignoring Proj.4 div0 check (seems unneccessary)
      chi = asin(sphi / C),
      ratexp = 0.5 * C * e,
      K = tan(0.5 * chi + M_FORTPI) / (pow(tan(0.5 * phi0 + M_FORTPI), C) *
        srat(e * sphi, ratexp));
  return {e: e, K: K, C: C, chi: chi, ratexp: ratexp, rc: rc};
}

function pj_gauss(elp, en) {
  return {
    phi: 2 * atan( en.K * pow(tan(0.5 * elp.phi + M_FORTPI), en.C) *
      srat(en.e * sin(elp.phi), en.ratexp) ) - M_HALFPI,
    lam: en.C * elp.lam
  };
}

function pj_inv_gauss(lp, en) {
  var MAX_ITER = 20,
      DEL_TOL = 1e-14,
      phi1 = lp.phi,
      num = pow(tan(0.5 * lp.phi + M_FORTPI)/en.K, 1/en.C),
      i, phi;
  lp.lam /= en.C;
  for (i = MAX_ITER; i>0; --i) {
    phi = 2 * atan(num * srat(en.e * sin(lp.phi), -0.5 * en.e)) - M_HALFPI;
    if (fabs(phi - lp.phi) < DEL_TOL) break;
    lp.phi = phi;
  }
  if (!i) pj_ctx_set_errno(-17); /* convergence failed */
}
