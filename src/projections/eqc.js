pj_add(pj_eqc, 'eqc', 'Equidistant Cylindrical (Plate Caree)', '\n\tCyl, Sph\n\tlat_ts=[, lat_0=0]');

function pj_eqc(P) {
  var rc = cos(pj_param(P.params, "rlat_ts"));
  if (rc <= 0) e_error(-24);
  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    xy.x = rc * lp.lam;
    xy.y = lp.phi -P.phi0;
  }

  function s_inv(xy, lp) {
    lp.lam = xy.x / rc;
    lp.phi = xy.y + P.phi0;
  }
}
