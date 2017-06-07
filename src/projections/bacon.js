pj_add(pj_apian, 'apian', 'Apian Globular I', '\n\tMisc Sph, no inv.');
pj_add(pj_ortel, 'ortel', 'Ortelius Oval', '\n\tMisc Sph, no inv.');
pj_add(pj_bacon, 'bacon', 'Bacon Globular', '\n\tMisc Sph, no inv.');

function pj_bacon(P) {
  pj_bacon_init(P, true, false);
}

function pj_apian(P) {
  pj_bacon_init(P, false, false);
}

function pj_ortel(P) {
  pj_bacon_init(P, false, true);
}

function pj_bacon_init(P, bacn, ortl) {
  P.es = 0;
  P.fwd = s_fwd;

  function s_fwd(lp, xy) {
    var HLFPI2 = 2.46740110027233965467; /* (pi/2)^2 */
    var EPS = 1e-10;
    var ax, f;
    xy.y = bacn ? M_HALFPI * sin(lp.phi) : lp.phi;
    if ((ax = fabs(lp.lam)) >= EPS) {
      if (ortl && ax >= M_HALFPI)
        xy.x = sqrt(HLFPI2 - lp.phi * lp.phi + EPS) + ax - M_HALFPI;
      else {
        f = 0.5 * (HLFPI2 / ax + ax);
        xy.x = ax - f + sqrt(f * f - xy.y * xy.y);
      }
      if (lp.lam < 0) xy.x = - xy.x;
    } else
      xy.x = 0;
  }
}
