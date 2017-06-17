/* @requires aasincos */

pj_add(pj_urm5, 'urm5', 'Urmaev V', '\n\tPCyl., Sph., no inv.\n\tn= q= alpha=');

function pj_urm5(P) {
  var m, rmn, q3, n;
  var alpha, t;
  n = pj_param(P.params, "dn");
  if (n > 0 && n <= 1 === false) {
    e_error(-40);
  }
  q3 = pj_param(P.params, "dq") / 3;
  alpha = pj_param(P.params, "ralpha");
  t = n * sin (alpha);
  m = cos (alpha) / sqrt (1 - t * t);
  rmn = 1 / (m * n);

  P.fwd = s_fwd;
  P.es = 0;

  function s_fwd(lp, xy) {
    var t = lp.phi = aasin (n * sin (lp.phi));
    xy.x = m * lp.lam * cos (lp.phi);
    t *= t;
    xy.y = lp.phi * (1 + t * q3) * rmn;
  }
}
