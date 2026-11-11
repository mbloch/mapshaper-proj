pj_add(pj_wintri, 'wintri', 'Winkel Tripel', 'Misc Sph\nlat_1');
pj_add(pj_aitoff, 'aitoff', 'Aitoff', 'Misc Sph');

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
    // basic Aitoff; computing it with atan2 (instead of acos) keeps relative
    // accuracy near the origin
    var sin_half_lam = sin(0.5 * lp.lam), sin_phi = sin(lp.phi), cos_phi = cos(lp.phi);
    var sin_alpha = hypot(cos_phi * sin_half_lam, sin_phi);
    // alpha / sin(alpha), with limit 1 at the origin
    var A = sin_alpha === 0 ? 1 : atan2(sin_alpha, cos_phi * cos(0.5 * lp.lam)) / sin_alpha;
    xy.x = 2 * cos_phi * sin_half_lam * A;
    xy.y = sin_phi * A;
    if (Q.mode) { /* Winkel Tripel */
      xy.x = (xy.x + lp.lam * Q.cosphi1) * 0.5;
      xy.y = (xy.y + lp.phi) * 0.5;
    }
  }

  function s_inv(xy, lp) {
    var MAXITER = 10,
        MAXROUND = 20,
        EPSILON = 1e-12,
        round = 0,
        iter, D, C, denom, determinant, f1, f2, f1p, f1l, f2p, f2l, dp, dl,
        sl, sp, cp, cl, x, y;

    if (!Q.mode) {
      // Aitoff: closed form. (x / 2, y) points along the great circle from the
      // centre, at angular distance alpha; without +over the map is the
      // ellipse alpha <= pi / 2
      var half_x = 0.5 * xy.x;
      var alpha = hypot(half_x, xy.y);
      if (alpha > (P.over ? M_PI : M_HALFPI * (1 + 1e-12))) {
        i_error();
        return;
      }
      var k = alpha === 0 ? 1 : sin(alpha) / alpha;
      var cos_alpha = cos(alpha);
      // cos(phi) * sin(lam / 2) = half_x * k, sin(phi) = y * k,
      // cos(phi) * cos(lam / 2) = cos(alpha)
      lp.lam = 2 * atan2(half_x * k, cos_alpha);
      lp.phi = atan2(xy.y * k, hypot(half_x * k, cos_alpha));
      return;
    }
    if (fabs(xy.x) < 1e-50 && fabs(xy.y) < 1e-50) {
      // first order inverse, exact to double precision this close to the
      // origin, where the Newton-Raphson terms below would underflow
      lp.phi = xy.y;
      lp.lam = 2 * xy.x / (1 + (Q.mode ? Q.cosphi1 : 1));
      return;
    }

    /* intial values for Newton-Raphson method */
    lp.phi = xy.y; lp.lam = xy.x;
    do {
      iter = 0;
      do {
        sl = sin(lp.lam * 0.5); cl = cos(lp.lam * 0.5);
        sp = sin(lp.phi); cp = cos(lp.phi);
        D = cp * cl;
        // 1 - D * D and acos(D), computed so that they stay accurate near the
        // origin, where D is close to 1
        C = sp * sp + cp * cp * sl * sl;
        denom = pow(C, 1.5);
        if (denom === 0) {
          i_error();
          return;
        }
        D = atan2(sqrt(C), D) / denom;
        f1 = 2 * D * C * cp * sl;
        f2 = D * C * sp;
        f1p = 2 * (sl * cl * sp * cp / C - D * sp * sl);
        f1l = cp * cp * sl * sl / C + D * cp * cl * sp * sp;
        f2p = sp * sp * cl / C + D * sl * sl * cp;
        f2l = 0.5 * (sp * cp * sl / C - D * sp * cp * cp * sl * cl);
        if (Q.mode) { /* Winkel Tripel */
          f1 = 0.5 * (f1 + lp.lam * Q.cosphi1);
          f2 = 0.5 * (f2 + lp.phi);
          f1p *= 0.5;
          f1l = 0.5 * (f1l + Q.cosphi1);
          f2p = 0.5 * (f2p + 1);
          f2l *= 0.5;
        }
        f1 -= xy.x; f2 -= xy.y;
        determinant = f1p * f2l - f2p * f1l;
        if (determinant === 0) {
          i_error();
          return;
        }
        dl = (f2 * f1p - f1 * f2p) / determinant;
        dp = (f1 * f2l - f2 * f1l) / determinant;
        dl %= M_PI; /* set to interval [-M_PI, M_PI] */
        lp.phi -= dp; lp.lam -= dl;
      } while ((fabs(dp) > EPSILON || fabs(dl) > EPSILON) && (iter++ < MAXITER));
      if (lp.phi > M_HALFPI) lp.phi -= 2*(lp.phi-M_HALFPI); /* correct if symmetrical solution for Aitoff */
      if (lp.phi < -M_HALFPI) lp.phi -= 2*(lp.phi+M_HALFPI); /* correct if symmetrical solution for Aitoff */
      if ((fabs(fabs(lp.phi) - M_HALFPI) < EPSILON) && (!Q.mode)) lp.lam = 0; /* if pole in Aitoff, return longitude of 0 */

      /* calculate x,y coordinates with solution obtained */
      var sol = {x: 0, y: 0};
      s_fwd({lam: lp.lam, phi: lp.phi}, sol);
      x = sol.x;
      y = sol.y;
    /* if too far from given values of x,y, repeat with better approximation of phi,lam */
    } while (((fabs(xy.x-x) > EPSILON) || (fabs(xy.y-y) > EPSILON)) && (round++ < MAXROUND));

    if (iter == MAXITER && round == MAXROUND) {
      // not ported: warning message
      // fprintf(stderr, "Warning: Accuracy of 1e-12 not reached. Last increments: dlat=%e and dlon=%e\n", dp, dl);
    }
  }
}
