pj_add(pj_nicol, 'nicol', 'Nicolosi Globular', 'Misc Sph, no inv');

function pj_nicol(P) {
  P.es = 0;
  P.fwd = s_fwd;

  function s_fwd(lp, xy) {
    var EPS = 1e-10;
    if (fabs(lp.lam) < EPS) {
      xy.x = 0;
      xy.y = lp.phi;
    } else if (fabs(lp.phi) < EPS) {
      xy.x = lp.lam;
      xy.y = 0;
    } else if (fabs(fabs(lp.lam) - M_HALFPI) < EPS) {
      xy.x = lp.lam * cos(lp.phi);
      xy.y = M_HALFPI * sin(lp.phi);
    } else if (fabs(fabs(lp.phi) - M_HALFPI) < EPS) {
      xy.x = 0;
      xy.y = lp.phi;
    } else {
      var tb = M_HALFPI / lp.lam - lp.lam / M_HALFPI;
      var c = lp.phi / M_HALFPI;
      var sp = sin(lp.phi);
      var d = (1 - c * c) / (sp - c);
      var r2 = tb / d;
      r2 *= r2;
      var m = (tb * sp / d - 0.5 * tb) / (1 + r2);
      var n = (sp / r2 + 0.5 * d) / (1 + 1 / r2);
      xy.x = cos(lp.phi);
      xy.x = sqrt(m * m + xy.x * xy.x / (1 + r2));
      xy.x = M_HALFPI * (m + (lp.lam < 0. ? -xy.x : xy.x));
      xy.y = sqrt(n * n - (sp * sp / r2 + d * sp - 1) / (1 + 1 / r2));
      xy.y = M_HALFPI * (n + (lp.phi < 0. ? xy.y : -xy.y));
    }
  }
}
