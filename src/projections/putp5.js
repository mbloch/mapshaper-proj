/* @requires aasincos */

pj_add(pj_putp5, 'putp5', 'Putnins P5', '\n\tPCyl., Sph.');
pj_add(pj_putp5p, 'putp5p', 'Putnins P5\'', '\n\tPCyl., Sph.');

function pj_putp5p(P) {
  pj_putp5(P, true);
}

function pj_putp5(P, prime) {
  var A = (prime ? 1.5 : 2),
      B = (prime ? 0.5 : 1),
      C = 1.01346,
      D = 1.2158542;

  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    xy.x = C * lp.lam * (A - B * sqrt(1 + D * lp.phi * lp.phi));
    xy.y = C * lp.phi;
  }

  function s_inv(xy, lp) {
    lp.phi = xy.y / C;
    lp.lam = xy.x / (C * (A - B * sqrt(1 + D * lp.phi * lp.phi)));
  }
}
