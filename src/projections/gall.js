pj_add(pj_gall, 'gall', 'Gall (Gall Stereographic)', '\n\tCyl, Sph');

function pj_gall(P) {
  var YF = 1.70710678118654752440,
      XF = 0.70710678118654752440,
      RYF = 0.58578643762690495119,
      RXF = 1.41421356237309504880;

  P.fwd = s_fwd;
  P.inv = s_inv;
  P.es = 0;

  function s_fwd(lp, xy) {
    xy.x = XF * lp.lam;
    xy.y = YF * tan(0.5 * lp.phi);
  }

  function s_inv(xy, lp) {
    lp.lam = RXF * xy.x;
    lp.phi = 2 * atan(xy.y * RYF);
  }
}
