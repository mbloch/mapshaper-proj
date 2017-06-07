pj_add(pj_gins8, 'gins8', 'Ginsburg VIII (TsNIIGAiK)', '\n\tPCyl, Sph., no inv.');

function pj_gins8(P) {
  P.fwd = s_fwd;
  P.es = 0;

  function s_fwd(lp, xy) {
    var Cl = 0.000952426;
    var Cp = 0.162388;
    var C12 = 0.08333333333333333;
    var t = lp.phi * lp.phi;
    xy.y = lp.phi * (1 + t * C12);
    xy.x = lp.lam * (1 - Cp * t);
    t = lp.lam * lp.lam;
    xy.x *= (0.87 - Cl * t * t);
  }
}
