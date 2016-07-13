/* @requires pj_mlfn */

pj_add(pj_cass, 'cass', 'Cassini', '\n\tCyl, Sph&Ell');

function pj_cass(P) {
  var C1 = 0.16666666666666666666,
      C2 = 0.00833333333333333333,
      C3 = 0.04166666666666666666,
      C4 = 0.33333333333333333333,
      C5 = 0.06666666666666666666;
  var m0, en;

  if (P.es) {
    en = pj_enfn(P.es);
    m0 = pj_mlfn(P.phi0,  sin(P.phi0),  cos(P.phi0), en);
    P.fwd = e_fwd;
    P.inv = e_inv;
  } else {
    P.fwd = s_fwd;
    P.inv = s_inv;
  }

  function e_fwd(lp, xy) {
    var n, t, a1, c, a2, tn;
    xy.y = pj_mlfn(lp.phi, n = sin(lp.phi), c = cos(lp.phi), en);

    n  = 1/sqrt(1 - P.es * n*n);
    tn = tan(lp.phi); t = tn * tn;
    a1 = lp.lam * c;
    c *= P.es * c / (1 - P.es);
    a2 = a1 * a1;

    xy.x = n * a1 * (1 - a2 * t * (C1 - (8 - t + 8 * c) * a2 * C2));
    xy.y -= m0 - n * tn * a2 * (0.5 + (5 - t + 6 * c) * a2 * C3);
  }

  function e_inv(xy, lp) {
    var n, t, r, dd, d2, tn, ph1;
    ph1 = pj_inv_mlfn (m0 + xy.y, P.es, en);
    tn  = tan(ph1); t = tn*tn;
    n   = sin(ph1);
    r   = 1 / (1 - P.es * n * n);
    n   = sqrt (r);
    r  *= (1 - P.es) * n;
    dd  = xy.x / n;
    d2  = dd * dd;
    lp.phi = ph1 - (n * tn / r) * d2 *(0.5 - (1 + 3 * t) * d2 * C3);
    lp.lam = dd * (1 + t * d2 * (-C4 + (1 + 3 * t) * d2 * C5)) / cos(ph1);
  }

  function s_fwd(lp, xy) {
    xy.x  =  asin(cos(lp.phi) * sin(lp.lam));
    xy.y  =  atan2(tan(lp.phi), cos(lp.lam)) - P.phi0;
  }

  function s_inv(xy, lp) {
    var dd =  xy.y + P.phi0;
    lp.phi = asin(sin(dd) * cos(xy.x));
    lp.lam = atan2(tan(xy.x), cos(dd));
  }
}
