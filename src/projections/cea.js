/* @requires pj_qsfn pj_auth */

pj_add(pj_cea, 'cea', 'Equal Area Cylindrical', '\n\tCyl, Sph&Ell\n\tlat_ts=');

function pj_cea(P) {
  var t = 0, qp, apa;
  if (pj_param(P.params, "tlat_ts")) {
    P.k0 = cos(t = pj_param(P.params, "rlat_ts"));
    if (P.k0 < 0) {
      e_error(-24);
    }
  }
  if (P.es) {
    t = sin(t);
    P.k0 /= sqrt(1 - P.es * t * t);
    P.e = sqrt(P.es);
    if (!(apa = pj_authset(P.es))) e_error_0();
    qp = pj_qsfn(1, P.e, P.one_es);
    P.fwd = e_fwd;
    P.inv = e_inv;
  } else {
    P.fwd = s_fwd;
    P.inv = s_inv;
  }

  function e_fwd(lp, xy) {
    xy.x = P.k0 * lp.lam;
    xy.y = 0.5 * pj_qsfn(sin (lp.phi), P.e, P.one_es) / P.k0;
  }

  function e_inv(xy, lp) {
    lp.phi = pj_authlat(asin(2 * xy.y * P.k0 / qp), apa);
    lp.lam = xy.x / P.k0;
  }

  function s_fwd(lp, xy) {
    xy.x = P.k0 * lp.lam;
    xy.y = sin(lp.phi) / P.k0;
  }

  function s_inv(xy, lp) {
    var x = xy.x, y = xy.y;
    var t;
    if ((t = fabs(y *= P.k0)) - EPS10 <= 1) {
      if (t >= 1)
        lp.phi = y < 0 ? -M_HALFPI : M_HALFPI;
      else
        lp.phi = asin(y);
      lp.lam = x / P.k0;
    } else i_error();
  }
}
