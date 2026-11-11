/* @requires aasincos */

pj_add(pj_hammer, 'hammer', 'Hammer & Eckert-Greifendorff', 'Misc Sph,\nW= M=');

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
    // Undo the M scaling of the forward: u = d * cos(phi) * sin(W * lam)
    // and v = d * sin(phi), with d = sqrt(2 / (1 + cos(phi) * cos(W * lam)))
    var u = xy.x / m, v = xy.y / rm;
    var z = sqrt(1 - 0.25 * u * u - 0.25 * v * v);
    // z * u = cos(phi) * sin(W * lam), z * v = sin(phi) and
    // c = 2 * z * z - 1 = cos(phi) * cos(W * lam)
    var c = 2 * z * z - 1;
    if (isNaN(z)) { // outside the ellipse
      lp.lam = HUGE_VAL;
      lp.phi = HUGE_VAL;
      i_error();
    } else {
      lp.lam = aatan2(z * u, c) / w;
      // asin(z * v), but accurate near the poles
      lp.phi = atan2(z * v, sqrt(z * u * z * u + c * c));
    }
  }
}
