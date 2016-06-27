pj_add(pj_wintri, 'wintri', 'Winkel Tripel', '\n\tMisc Sph\n\tlat_1');
pj_add(pj_aitoff, 'aitoff', 'Aitoff', '\n\tMisc Sph');

function pj_wintri(P) {
  var Q = P.opaque = {mode: 1};
  if (pj_param(P.params, "tlat_1")) {
    if ((Q.cosphi1 = cos(pj_param(P.params, "rlat_1"))) === 0) {
      e_error(-22);
    }
  } else { /* 50d28' or acos(2/pi) */
    Q.cosphi1 = 0.636619772367581343;
  }
  pj_aitoff(P);
}

function pj_aitoff(P) {
  var Q = P.opaque || {mode: 0};

  P.inv = s_inv;
  P.fwd = s_fwd;
  P.es = 0;

  function s_fwd(lp, xy) {
    var c, d;
    if((d = acos(cos(lp.phi) * cos(c = 0.5 * lp.lam)))) {/* basic Aitoff */
      xy.x = 2 * d * cos(lp.phi) * sin(c) * (xy.y = 1 / sin(d));
      xy.y *= d * sin(lp.phi);
    } else
      xy.x = xy.y = 0;
    if (Q.mode) { /* Winkel Tripel */
      xy.x = (xy.x + lp.lam * Q.cosphi1) * 0.5;
      xy.y = (xy.y + lp.phi) * 0.5;
    }
  }

  function s_inv(xy, lp) {
    fatal("inverse projection not implemented");
  }
}
