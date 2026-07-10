/* @requires gn_sinu, moll */
pj_add(pj_igh, 'igh', 'Interrupted Goode Homolosine', 'PCyl, Sph., no inv.');

// Forward-only implementation of the standard land-emphasis layout.
// Projection regions and source-geometry cutting are separate concerns:
// mproj routes points; clients such as Mapshaper must split paths at the
// interruption meridians before projecting them.
function pj_igh(P) {
  var D2R = M_PI / 180,
      PHI_LIM = (40 + 44 / 60 + 11.8 / 3600) * D2R,
      LON_NORTH = -40 * D2R,
      LON_SOUTH_1 = -100 * D2R,
      LON_SOUTH_2 = -20 * D2R,
      LON_SOUTH_3 = 80 * D2R,
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
      return lp.lam <= LON_NORTH ? -100 * D2R : 30 * D2R;
    }
    if (lp.lam <= LON_SOUTH_1) return -160 * D2R;
    if (lp.lam <= LON_SOUTH_2) return -60 * D2R;
    if (lp.lam <= LON_SOUTH_3) return 20 * D2R;
    return 140 * D2R;
  }

  function getYCorr() {
    var lp = {lam: 0, phi: PHI_LIM},
        sinuXY = {},
        mollXY = {};
    sinuFwd({lam: lp.lam, phi: lp.phi}, sinuXY);
    mollFwd({lam: lp.lam, phi: lp.phi}, mollXY);
    return mollXY.y - sinuXY.y;
  }
}
