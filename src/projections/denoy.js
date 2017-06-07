pj_add(pj_denoy, 'denoy', 'Denoyer Semi-Elliptical', '\n\tPCyl, Sph., no inv.');

function pj_denoy(P) {
  P.fwd = s_fwd;
  P.es = 0;

  function s_fwd(lp, xy) {
    var C0 = 0.95;
    var C1 = -0.08333333333333333333;
    var C3 = 0.00166666666666666666;
    var D1 = 0.9;
    var D5 = 0.03;
    var lam = fabs(lp.lam);
    xy.y = lp.phi;
    xy.x = lp.lam;
    xy.x *= cos((C0 + lam * (C1 + lam * lam * C3)) *
            (lp.phi * (D1 + D5 * lp.phi * lp.phi * lp.phi * lp.phi)));

  }
}
