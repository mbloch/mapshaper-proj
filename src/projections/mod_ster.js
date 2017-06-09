/* @requires pj_zpoly1 */

pj_add(pj_mil_os, 'mil_os', 'Miller Oblated Stereographic', '\n\tAzi(mod)');
pj_add(pj_lee_os, 'lee_os', 'Lee Oblated Stereographic', '\n\tAzi(mod)');
pj_add(pj_gs48, 'gs48', 'Mod Stereographic of 48 U.S.', '\n\tAzi(mod)');
pj_add(pj_alsk, 'alsk', 'Mod Stereographic of Alaska', '\n\tAzi(mod)');
pj_add(pj_gs50, 'gs50', 'Mod Stereographic of 50 U.S.', '\n\tAzi(mod)');

function pj_mil_os(P) {
  var AB = [
    [0.924500, 0],
    [0,        0],
    [0.019430, 0]
  ];
  P.lam0 = DEG_TO_RAD * 20;
  P.phi0 = DEG_TO_RAD * 18;
  P.es = 0;
  pj_mod_ster(P, AB);
}

function pj_lee_os(P) {
  var AB = [
    [0.721316,    0],
    [0,           0],
    [-0.0088162, -0.00617325]
  ];
  P.lam0 = DEG_TO_RAD * -165;
  P.phi0 = DEG_TO_RAD * -10;
  P.es = 0;
  pj_mod_ster(P, AB);
}

function pj_gs48(P) {
  var AB = [
    [0.98879,   0],
    [0,         0],
    [-0.050909, 0],
    [0,         0],
    [0.075528,  0]
  ];
  P.lam0 = DEG_TO_RAD * -96;
  P.phi0 = DEG_TO_RAD * 39;
  P.es = 0;
  P.a = 6370997;
  pj_mod_ster(P, AB);
}

function pj_alsk(P) {
  var ABe = [ /* Alaska ellipsoid */
    [ 0.9945303, 0],
    [ 0.0052083, -0.0027404],
    [ 0.0072721,  0.0048181],
    [-0.0151089, -0.1932526],
    [ 0.0642675, -0.1381226],
    [ 0.3582802, -0.2884586],
  ];
  var ABs = [ /* Alaska sphere */
    [ 0.9972523,  0],
    [ 0.0052513, -0.0041175],
    [ 0.0074606,  0.0048125],
    [-0.0153783, -0.1968253],
    [ 0.0636871, -0.1408027],
    [ 0.3660976, -0.2937382]
  ];
  var AB;
  P.lam0 = DEG_TO_RAD * -152;
  P.phi0 = DEG_TO_RAD * 64;
  if (P.es != 0.0) { /* fixed ellipsoid/sphere */
    AB = ABe;
    P.a = 6378206.4;
    P.e = sqrt(P.es = 0.00676866);
  } else {
    AB = ABs;
    P.a = 6370997;
  }
  pj_mod_ster(P, AB);
}

function pj_gs50(P) {
  var ABe = [
    [ 0.9827497,  0],
    [ 0.0210669,  0.0053804],
    [-0.1031415, -0.0571664],
    [-0.0323337, -0.0322847],
    [ 0.0502303,  0.1211983],
    [ 0.0251805,  0.0895678],
    [-0.0012315, -0.1416121],
    [ 0.0072202, -0.1317091],
    [-0.0194029,  0.0759677],
    [-0.0210072,  0.0834037]
  ];
  var ABs = [
    [ 0.9842990,  0],
    [ 0.0211642,  0.0037608],
    [-0.1036018, -0.0575102],
    [-0.0329095, -0.0320119],
    [ 0.0499471,  0.1223335],
    [ 0.0260460,  0.0899805],
    [ 0.0007388, -0.1435792],
    [ 0.0075848, -0.1334108],
    [-0.0216473,  0.0776645],
    [-0.0225161,  0.0853673]
  ];
  var AB;
  P.lam0 = DEG_TO_RAD * -120;
  P.phi0 = DEG_TO_RAD * 45;
  if (P.es != 0.0) { /* fixed ellipsoid/sphere */
    AB = ABe;
    P.a = 6378206.4;
    P.e = sqrt(P.es = 0.00676866);
  } else {
    AB = ABs;
    P.a = 6370997;
  }
  pj_mod_ster(P, AB);
}

function pj_mod_ster(P, zcoeff) {
  var EPSLN = 1e-12;
  var esphi, chio;
  var cchio, schio;
  if (P.es != 0.0) {
    esphi = P.e * sin(P.phi0);
    chio = 2 * atan(tan((M_HALFPI + P.phi0) * 0.5) *
        pow((1 - esphi) / (1 + esphi), P.e * 0.5)) - M_HALFPI;
  } else
    chio = P.phi0;
  schio = sin(chio);
  cchio = cos(chio);
  P.inv = e_inv;
  P.fwd = e_fwd;

  function e_fwd(lp, xy) {
    var sinlon, coslon, esphi, chi, schi, cchi, s;
    var p = {};

    sinlon = sin(lp.lam);
    coslon = cos(lp.lam);
    esphi = P.e * sin(lp.phi);
    chi = 2 * atan(tan((M_HALFPI + lp.phi) * 0.5) *
        pow((1 - esphi) / (1 + esphi), P.e * 0.5)) - M_HALFPI;
    schi = sin(chi);
    cchi = cos(chi);
    s = 2 / (1 + schio * schi + cchio * cchi * coslon);
    p.r = s * cchi * sinlon;
    p.i = s * (cchio * schi - schio * cchi * coslon);
    p = pj_zpoly1(p, zcoeff);
    xy.x = p.r;
    xy.y = p.i;
  }

  function e_inv(xy, lp) {
    var nn;
    var p = {}, fxy, fpxy = {}, dp = {}; // complex numbers
    var den, rh = 0.0, z, sinz = 0.0, cosz = 0.0, chi, phi = 0.0, esphi;
    var dphi;

    p.r = xy.x;
    p.i = xy.y;
    for (nn = 20; nn ;--nn) {
      fxy = pj_zpolyd1(p, zcoeff, fpxy);
      fxy.r -= xy.x;
      fxy.i -= xy.y;
      den = fpxy.r * fpxy.r + fpxy.i * fpxy.i;
      dp.r = -(fxy.r * fpxy.r + fxy.i * fpxy.i) / den;
      dp.i = -(fxy.i * fpxy.r - fxy.r * fpxy.i) / den;
      p.r += dp.r;
      p.i += dp.i;
      if ((fabs(dp.r) + fabs(dp.i)) <= EPSLN)
          break;
    }
    if (nn) {
      rh = hypot(p.r, p.i);
      z = 2 * atan(0.5 * rh);
      sinz = sin(z);
      cosz = cos(z);
      lp.lam = P.lam0;
      if (fabs(rh) <= EPSLN) {
        /* if we end up here input coordinates were (0,0).
         * pj_inv() adds P.lam0 to lp.lam, this way we are
         * sure to get the correct offset */
        lp.lam = 0.0;
        lp.phi = P.phi0;
        return;
      }
      chi = aasin(cosz * schio + p.i * sinz * cchio / rh);
      phi = chi;
      for (nn = 20; nn ;--nn) {
        esphi = P.e * sin(phi);
        dphi = 2 * atan(tan((M_HALFPI + chi) * 0.5) *
            pow((1 + esphi) / (1 - esphi), P.e * 0.5)) - M_HALFPI - phi;
        phi += dphi;
        if (fabs(dphi) <= EPSLN)
          break;
      }
    }
    if (nn) {
      lp.phi = phi;
      lp.lam = atan2(p.r * sinz, rh * cchio * cosz - p.i * schio * sinz);
    } else
      lp.lam = lp.phi = HUGE_VAL;
  }
}
