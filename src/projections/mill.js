pj_add(pj_mill, 'mill', 'Miller Cylindrical', '\n\tCyl, Sph');

function pj_mill(P) {

  P.fwd = s_fwd;
  P.inv = s_inv;
  P.es = 0;

  function s_fwd(lp, xy) {
    xy.x = lp.lam;
    xy.y = log(tan(M_FORTPI + lp.phi * 0.4)) * 1.25;
  }

  function s_inv(xy, lp) {
    lp.lam = xy.x;
    lp.phi = 2.5 * (atan(exp(0.8 * xy.y)) - M_FORTPI);
  }
}
