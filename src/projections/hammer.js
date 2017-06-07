/* @requires aasincos */

pj_add(pj_hammer, 'hammer', 'Hammer & Eckert-Greifendorff', '\n\tMisc Sph, \n\tW= M=');

function pj_hammer(P) {
  var w, m, rm;
  var EPS = 1e-10;
  P.inv = s_inv;
  P.fwd = s_fwd;
  P.es = 0;

  if (pj_param(P.params, "tW")) {
    if ((w = fabs(pj_param(P.params, "dW"))) <= 0) e_error(-27);
  } else
    w = 0.5;
  if (pj_param(P.params, "tM")) {
      if ((m = fabs(pj_param(P.params, "dM"))) <= 0) e_error(-27);
  } else
      m = 1;
  rm = 1 / m;
  m /= w;

  function s_fwd(lp, xy) {
    var cosphi, d;
    d = sqrt(2/(1 + (cosphi = cos(lp.phi)) * cos(lp.lam *= w)));
    xy.x = m * d * cosphi * sin(lp.lam);
    xy.y = rm * d * sin(lp.phi);
  }

  function s_inv(xy, lp) {
    var z = sqrt(1 - 0.25*w*w*xy.x*xy.x - 0.25*xy.y*xy.y);
    if (fabs(2*z*z-1) < EPS) {
      lp.lam = HUGE_VAL;
      lp.phi = HUGE_VAL;
      pj_errno = -14;
    } else {
      lp.lam = aatan2(w * xy.x * z,2 * z * z - 1)/w;
      lp.phi = aasin(z * xy.y);
    }
  }
}
