/* @requires aasincos */

pj_add(pj_putp6, 'putp6', 'Putnins P6', '\n\tPCyl., Sph.');
pj_add(pj_putp6p, 'putp6p', 'Putnins P6\'', '\n\tPCyl., Sph.');

function pj_putp6p(P) {
  pj_putp6(P, true);
}

function pj_putp6(P, prime) {
  var EPS = 1e-10,
      NITER = 10,
      CON_POLE = 1.732050807568877,
      A, B, C_x, C_y, D;

  if (prime) {
    C_x = 0.44329;
    C_y = 0.80404;
    A   = 6;
    B   = 5.61125;
    D   = 3;
  } else {
    C_x = 1.01346;
    C_y = 0.91910;
    A   = 4;
    B   = 2.1471437182129378784;
    D   = 2;
  }

  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    var p, r, V, i;
    p = B * sin(lp.phi);
    lp.phi *=  1.10265779;
    for (i = NITER; i ; --i) {
        r = sqrt(1 + lp.phi * lp.phi);
        lp.phi -= V = ( (A - r) * lp.phi - log(lp.phi + r) - p ) /
            (A - 2 * r);
        if (fabs(V) < EPS)
            break;
    }
    if (!i)
        lp.phi = p < 0 ? -CON_POLE : CON_POLE;
    xy.x = C_x * lp.lam * (D - sqrt(1 + lp.phi * lp.phi));
    xy.y = C_y * lp.phi;
  }

  function s_inv(xy, lp) {
    var r;
    lp.phi = xy.y / C_y;
    r = sqrt(1 + lp.phi * lp.phi);
    lp.lam = xy.x / (C_x * (D - r));
    lp.phi = aasin(((A - r) * lp.phi - log(lp.phi + r)) / B);
  }
}
