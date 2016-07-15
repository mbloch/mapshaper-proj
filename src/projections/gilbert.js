/* @requires aasincos */
// from

pj_add(pj_gilbert, 'gilbert', 'Gilbert Two World Perspective', '\n\tPCyl., Sph., NoInv.\n\tlat_1=');

function pj_gilbert(P) {
  var lat1 = pj_param(P.params, 'tlat_1') ? pj_param(P.params, 'rlat_1') : 0,
      phi1 = phiprime(lat1),
      sp1 = sin(phi1),
      cp1 = cos(phi1);
  P.fwd = s_fwd;
  P.es = 0;

  function s_fwd(lp, xy) {
    var lam = lp.lam * 0.5,
        phi = phiprime(lp.phi),
        sp = sin(phi),
        cp = cos(phi),
        cl = cos(lam);
    if ((sp1*sp + cp1*cp*cl) >= 0) {
      xy.x = cp * sin(lam);
      xy.y = cp1 * sp - sp1 * cp * cl;
    } else {
      f_error();
    }
  }

  function phiprime(phi) {
    return aasin(tan(0.5 * phi));
  }
}
