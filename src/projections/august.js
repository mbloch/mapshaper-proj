pj_add(pj_august, 'august', 'August Epicycloidal', '\n\tMisc Sph, no inv.');

function pj_august(P) {
  P.fwd = s_fwd;
  P.es = 0;

  function s_fwd(lp, xy) {
    var M = 4 / 3;
    var lam = lp.lam;
    var t, c1, c, x1, x12, y1, y12;
    t = tan(0.5 * lp.phi);
    c1 = sqrt(1 - t * t);
    c = 1 + c1 * cos(lam *= 0.5);
    x1 = sin(lam) *  c1 / c;
    y1 =  t / c;
    xy.x = M * x1 * (3 + (x12 = x1 * x1) - 3 * (y12 = y1 *  y1));
    xy.y = M * y1 * (3 + 3 * x12 - y12);
  }
}
