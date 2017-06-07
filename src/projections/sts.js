/* @requires aasincos */

pj_add(pj_kav5, 'kav5', 'Kavraisky V', '\n\tPCyl., Sph.');
pj_add(pj_qua_aut, 'qua_aut', 'Quartic Authalic', '\n\tPCyl., Sph.');
pj_add(pj_fouc, 'fouc', 'Foucaut', '\n\tPCyl., Sph.');
pj_add(pj_mbt_s, 'mbt_s', 'McBryde-Thomas Flat-Polar Sine (No. 1)', '\n\tPCyl., Sph.');

function pj_kav5(P) {
  pj_sts(P, 1.50488, 1.35439, false);
}

function pj_qua_aut(P) {
  pj_sts(P, 2, 2, false);
}

function pj_fouc(P) {
  pj_sts(P, 2, 2, true);
}

function pj_mbt_s(P) {
  pj_sts(P, 1.48875, 1.36509, false);
}

function pj_sts(P, p, q, tan_mode) {
  var C_x = q / p;
  var C_y = p;
  var C_p = 1 / q;
  P.inv = s_inv;
  P.fwd = s_fwd;
  P.es = 0;

  function s_fwd(lp, xy) {
    var c;
    xy.x = C_x * lp.lam * cos(lp.phi);
    xy.y = C_y;
    lp.phi *= C_p;
    c = cos(lp.phi);
    if (tan_mode) {
      xy.x *= c * c;
      xy.y *= tan(lp.phi);
    } else {
      xy.x /= c;
      xy.y *= sin (lp.phi);
    }
  }

  function s_inv(xy, lp) {
    var c;
    xy.y /= C_y;
    c = cos (lp.phi = tan_mode ? atan(xy.y) : aasin(xy.y));
    lp.phi /= C_p;
    lp.lam = xy.x / (C_x * cos(lp.phi));
    if (tan_mode)
      lp.lam /= c * c;
    else
      lp.lam *= c;
  }
}
