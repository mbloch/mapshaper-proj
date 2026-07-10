/* @requires gn_sinu, moll */
pj_add(pj_igh_o, 'igh_o', 'Interrupted Goode Homolosine Oceanic View', 'PCyl, Sph., no inv.');

function pj_igh_o(P) {
  var D2R = M_PI / 180,
      PHI_LIM = (40 + 44 / 60 + 11.8 / 3600) * D2R,
      NORTH_WEST = -90 * D2R,
      NORTH_EAST = 60 * D2R,
      SOUTH_WEST = -60 * D2R,
      SOUTH_EAST = 90 * D2R,
      sinuFwd, mollFwd, yCor;

  P.es = 0;
  pj_sinu(P);
  sinuFwd = P.fwd;
  pj_moll(P);
  mollFwd = P.fwd;
  yCor = getYCorr();
  P.inv = null;

  P.fwd = function(lp, xy) {
    var phi = lp.phi,
        lon0 = getLobeCenter(lp),
        useMoll = fabs(phi) >= PHI_LIM;
    lp.lam -= lon0;
    if (useMoll) {
      mollFwd(lp, xy);
      xy.y -= phi > 0 ? yCor : -yCor;
    } else {
      sinuFwd(lp, xy);
    }
    xy.x += lon0;
  };

  function getLobeCenter(lp) {
    if (lp.phi >= 0) {
      if (lp.lam <= NORTH_WEST) return -140 * D2R;
      if (lp.lam >= NORTH_EAST) return 130 * D2R;
      return -10 * D2R;
    }
    if (lp.lam <= SOUTH_WEST) return -110 * D2R;
    if (lp.lam >= SOUTH_EAST) return 150 * D2R;
    return 20 * D2R;
  }

  function getYCorr() {
    var sinuXY = {},
        mollXY = {};
    sinuFwd({lam: 0, phi: PHI_LIM}, sinuXY);
    mollFwd({lam: 0, phi: PHI_LIM}, mollXY);
    return mollXY.y - sinuXY.y;
  }
}
