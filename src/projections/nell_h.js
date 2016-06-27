pj_add(pj_nell_h, 'nell_h', 'Nell-Hammer', '\n\tPCyl., Sph.');

function pj_nell_h(P) {
var NITER = 9,
    EPS = 1e-7;
  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    xy.x = 0.5 * lp.lam * (1 + cos(lp.phi));
    xy.y = 2.0 * (lp.phi - tan(0.5 *lp.phi));
  }

  function s_inv(xy, lp) {
    var V, c, p, i;
    p = 0.5 * xy.y;
    for (i = NITER; i>0; --i) {
      c = cos(0.5 * lp.phi);
      lp.phi -= V = (lp.phi - tan(lp.phi/2) - p)/(1 - 0.5/(c*c));
      if (fabs(V) < EPS)
        break;
    }
    if (!i) {
      lp.phi = p < 0 ? -M_HALFPI : M_HALFPI;
      lp.lam = 2 * xy.x;
    } else
      lp.lam = 2 * xy.x / (1 + cos(lp.phi));
  }
}
