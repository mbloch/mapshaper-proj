pj_add(pj_tcea, 'tcea', 'Transverse Cylindrical Equal Area', '\n\tCyl, Sph');

function pj_tcea(P) {
  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    xy.x = cos (lp.phi) * sin (lp.lam) / P.k0;
    xy.y = P.k0 * (atan2 (tan (lp.phi), cos (lp.lam)) - P.phi0);
  }

  function s_inv(xy, lp) {
    var t;
    xy.y = xy.y / P.k0 + P.phi0;
    xy.x *= P.k0;
    t = sqrt (1 - xy.x * xy.x);
    lp.phi = asin (t * sin (xy.y));
    lp.lam = atan2 (xy.x, t * cos (xy.y));
  }
}
