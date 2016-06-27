/* @requires aasincos */

pj_add(pj_wag2, 'wag2', 'Wagner II', '\n\tPCyl., Sph.');
pj_add(pj_wag3, 'wag3', 'Wagner III', '\n\tPCyl., Sph.\n\tlat_ts=');
pj_add(pj_wag7, 'wag7', 'Wagner VII', '\n\tMisc Sph, no inv.');

function pj_wag2(P) {
  var C_x = 0.92483,
      C_y = 1.38725,
      C_p1 = 0.88022,
      C_p2 = 0.88550;

  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    lp.phi = aasin(C_p1 * sin (C_p2 * lp.phi));
    xy.x = C_x * lp.lam * cos (lp.phi);
    xy.y = C_y * lp.phi;
  }

  function s_inv(xy, lp) {
    lp.phi = xy.y / C_y;
    lp.lam = xy.x / (C_x * cos(lp.phi));
    lp.phi = aasin(sin(lp.phi) / C_p1) / C_p2;
  }
}

function pj_wag3(P) {
  var TWOTHIRD = 0.6666666666666666666667,
      ts = pj_param(P.params, "rlat_ts"),
      C_x = cos(ts) / cos(2*ts/3);

  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    xy.x = C_x * lp.lam * cos(TWOTHIRD * lp.phi);
    xy.y = lp.phi;
  }

  function s_inv(xy, lp) {
    lp.phi = xy.y;
    lp.lam = xy.x / (C_x * cos(TWOTHIRD * lp.phi));
  }
}

function pj_wag7(P) {
  P.es = 0;
  P.fwd = function(lp, xy) {
    var theta, ct, D;
    theta = asin (xy.y = 0.90630778703664996 * sin(lp.phi));
    xy.x  = 2.66723 * (ct = cos (theta)) * sin (lp.lam /= 3);
    xy.y *= 1.24104 * (D = 1/(sqrt (0.5 * (1 + ct * cos(lp.lam)))));
    xy.x *= D;
  };
}
