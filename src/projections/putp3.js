/* @requires aasincos */

pj_add(pj_putp3, 'putp3', 'Putnins P3', '\n\tPCyl., Sph.');
pj_add(pj_putp3p, 'putp3p', 'Putnins P3\'', '\n\tPCyl., Sph.');

function pj_putp3p(P) {
  pj_putp3(P, true);
}

function pj_putp3(P, prime) {
  var C = 0.79788456,
      RPISQ = 0.1013211836,
      A = (prime ? 2 : 4) * RPISQ;
  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    xy.x = C * lp.lam * (1 - A * lp.phi * lp.phi);
    xy.y = C * lp.phi;
  }

  function s_inv(xy, lp) {
    lp.phi = xy.y / C;
    lp.lam = xy.x / (C * (1 - A * lp.phi * lp.phi));
  }
}
