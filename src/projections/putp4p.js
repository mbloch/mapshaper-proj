/* @requires aasincos */

pj_add(pj_putp4p, 'putp4p', 'Putnins P4\'', '\n\tPCyl., Sph.');
pj_add(pj_weren, 'weren', 'Werenskiold I', '\n\tPCyl., Sph.');

function pj_putp4p(P) {
  pj_putp4p_init(P, 0.874038744, 3.883251825);
}

function pj_weren(P) {
  pj_putp4p_init(P, 1, 4.442882938);
}

function pj_putp4p_init(P, C_x, C_y) {
  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    lp.phi = aasin(0.883883476 * sin(lp.phi));
    xy.x = C_x * lp.lam * cos(lp.phi);
    xy.x /= cos(lp.phi *= 0.333333333333333);
    xy.y = C_y * sin(lp.phi);
  }

  function s_inv(xy, lp) {
    lp.phi = aasin(xy.y / C_y);
    lp.lam = xy.x * cos(lp.phi) / C_x;
    lp.phi *= 3;
    lp.lam /= cos(lp.phi);
    lp.phi = aasin(1.13137085 * sin(lp.phi));
  }
}
