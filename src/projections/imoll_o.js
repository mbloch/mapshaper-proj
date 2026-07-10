/* @requires moll */
pj_add(pj_imoll_o, 'imoll_o', 'Interrupted Mollweide Oceanic View', 'PCyl, Sph., no inv.');

function pj_imoll_o(P) {
  var D2R = M_PI / 180,
      EPS = 1e-10,
      centers = [-140, -10, 130, -110, 20, 150].map(toRadians),
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
    if (lp.phi >= 0) {
      if (lp.lam <= -90 * D2R) return 0;
      if (lp.lam >= 60 * D2R) return 2;
      return 1;
    }
    if (lp.lam <= -60 * D2R) return 3;
    if (lp.lam >= 90 * D2R) return 5;
    return 4;
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
    offsets[1] += getZoneOffset(1, 0, -90 * D2R, EPS, EPS);
    offsets[2] += getZoneOffset(2, 1, 60 * D2R, EPS, EPS);
    offsets[3] += getZoneOffset(3, 0, -180 * D2R, -EPS, EPS);
    offsets[4] += getZoneOffset(4, 1, -60 * D2R, -EPS, EPS);
    offsets[5] += getZoneOffset(5, 2, 90 * D2R, -EPS, EPS);
  }

  function toRadians(degrees) {
    return degrees * D2R;
  }
}
