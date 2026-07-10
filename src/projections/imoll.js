/* @requires moll */
pj_add(pj_imoll, 'imoll', 'Interrupted Mollweide', 'PCyl, Sph., no inv.');

function pj_imoll(P) {
  var D2R = M_PI / 180,
      EPS = 1e-10,
      centers = [-100, 30, -160, -60, 20, 140].map(toRadians),
      offsets = centers.concat(),
      mollFwd;

  P.es = 0;
  pj_moll(P);
  mollFwd = P.fwd;
  adjustOffsets();
  P.inv = null;

  P.fwd = function(lp, xy) {
    var zone = getZone(lp);
    projectZone(zone, lp.lam, lp.phi, xy);
  };

  function getZone(lp) {
    if (lp.phi >= 0) return lp.lam <= -40 * D2R ? 0 : 1;
    if (lp.lam <= -100 * D2R) return 2;
    if (lp.lam <= -20 * D2R) return 3;
    if (lp.lam <= 80 * D2R) return 4;
    return 5;
  }

  function projectZone(zone, lam, phi, xy) {
    mollFwd({lam: lam - centers[zone], phi: phi}, xy);
    xy.x += offsets[zone];
  }

  function getZoneOffset(zone1, zone2, lam, phi1, phi2) {
    var xy1 = {}, xy2 = {};
    projectZone(zone1, lam, phi1, xy1);
    projectZone(zone2, lam, phi2, xy2);
    return xy2.x - xy1.x;
  }

  function adjustOffsets() {
    offsets[2] += getZoneOffset(2, 0, -160 * D2R, -EPS, EPS);
    offsets[1] += getZoneOffset(1, 0, -40 * D2R, EPS, EPS);
    offsets[3] += getZoneOffset(3, 0, -100 * D2R, -EPS, EPS);
    offsets[4] += getZoneOffset(4, 1, -20 * D2R, -EPS, EPS);
    offsets[5] += getZoneOffset(5, 1, 80 * D2R, -EPS, EPS);
  }

  function toRadians(degrees) {
    return degrees * D2R;
  }
}
