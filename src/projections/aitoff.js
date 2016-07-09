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
    var MAXITER = 10,
        MAXROUND = 20,
        EPSILON = 1e-12,
        round = 0,
        iter, D, C, f1, f2, f1p, f1l, f2p, f2l, dp, dl, sl, sp, cp, cl, x, y;

    if ((fabs(xy.x) < EPSILON) && (fabs(xy.y) < EPSILON )) {
      lp.phi = 0;
      lp.lam = 0;
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
        C = 1 - D * D;
        D = acos(D) / pow(C, 1.5);
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
        dl = (f2 * f1p - f1 * f2p) / (dp = f1p * f2l - f2p * f1l);
        dp = (f1 * f2l - f2 * f1l) / dp;
        while (dl > M_PI) dl -= M_PI; /* set to interval [-M_PI, M_PI]  */
        while (dl < -M_PI) dl += M_PI; /* set to interval [-M_PI, M_PI]  */
        lp.phi -= dp; lp.lam -= dl;
      } while ((fabs(dp) > EPSILON || fabs(dl) > EPSILON) && (iter++ < MAXITER));
      if (lp.phi > M_HALFPI) lp.phi -= 2*(lp.phi-M_HALFPI); /* correct if symmetrical solution for Aitoff */
      if (lp.phi < -M_HALFPI) lp.phi -= 2*(lp.phi+M_HALFPI); /* correct if symmetrical solution for Aitoff */
      if ((fabs(fabs(lp.phi) - M_HALFPI) < EPSILON) && (!Q.mode)) lp.lam = 0; /* if pole in Aitoff, return longitude of 0 */

      /* calculate x,y coordinates with solution obtained */
      if((D = acos(cos(lp.phi) * cos(C = 0.5 * lp.lam)))) {/* Aitoff */
        x = 2 * D * cos(lp.phi) * sin(C) * (y = 1 / sin(D));
        y *= D * sin(lp.phi);
      } else
        x = y = 0;
      if (Q.mode) { /* Winkel Tripel */
        x = (x + lp.lam * Q.cosphi1) * 0.5;
        y = (y + lp.phi) * 0.5;
      }
    /* if too far from given values of x,y, repeat with better approximation of phi,lam */
    } while (((fabs(xy.x-x) > EPSILON) || (fabs(xy.y-y) > EPSILON)) && (round++ < MAXROUND));

    if (iter == MAXITER && round == MAXROUND) {
      // not ported: warning message
      // fprintf(stderr, "Warning: Accuracy of 1e-12 not reached. Last increments: dlat=%e and dlon=%e\n", dp, dl);
    }
  }
}
