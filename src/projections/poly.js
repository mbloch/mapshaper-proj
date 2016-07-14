/* @requires pj_mlfn pj_msfn */

pj_add(pj_poly, 'poly', 'Polyconic (American)', '\n\tConic, Sph&Ell');

function pj_poly(P) {
  var TOL = 1e-10,
      CONV = 1e-10,
      N_ITER = 10,
      I_ITER = 20,
      ITOL = 1.e-12,
      ml0, en;

  if (P.es) {
    en = pj_enfn(P.es);
    ml0 = pj_mlfn(P.phi0, sin(P.phi0), cos(P.phi0), en);
    P.fwd = e_fwd;
    P.inv = e_inv;
  } else {
    ml0 = -P.phi0;
    P.fwd = s_fwd;
    P.inv = s_inv;
  }

  function e_fwd(lp, xy) {
    var ms, sp, cp;

    if (fabs(lp.phi) <= TOL) {
      xy.x = lp.lam;
      xy.y = -ml0;
    } else {
      sp = sin(lp.phi);
      ms = fabs(cp = cos(lp.phi)) > TOL ? pj_msfn(sp, cp, P.es) / sp : 0;
      xy.x = ms * sin(lp.lam *= sp);
      xy.y = (pj_mlfn(lp.phi, sp, cp, en) - ml0) + ms * (1 - cos(lp.lam));
    }
  }

  function e_inv(xy, lp) {
    var x = xy.x, y = xy.y;
    var r, c, sp, cp, s2ph, ml, mlb, mlp, dPhi, i;
    y += ml0;
    if (fabs(y) <= TOL) {
      lp.lam = x;
      lp.phi = 0;
    } else {
      r = y * y + x * x;
      for (lp.phi = y, i = I_ITER; i>0 ; --i) {
        sp = sin(lp.phi);
        s2ph = sp * (cp = cos(lp.phi));
        if (fabs(cp) < ITOL)
          i_error();
        c = sp * (mlp = sqrt(1 - P.es * sp * sp)) / cp;
        ml = pj_mlfn(lp.phi, sp, cp, en);
        mlb = ml * ml + r;
        mlp = P.one_es / (mlp * mlp * mlp);
        lp.phi += (dPhi =
          ( ml + ml + c * mlb - 2 * y * (c * ml + 1) ) / (
          P.es * s2ph * (mlb - 2 * y * ml) / c +
          2 * (y - ml) * (c * mlp - 1 / s2ph) - mlp - mlp));
        if (fabs(dPhi) <= ITOL)
          break;
      }
      if (!i) {
        i_error();
      }
      c = sin(lp.phi);
      lp.lam = asin(x * tan(lp.phi) * sqrt(1 - P.es * c * c)) / sin(lp.phi);
    }
  }

  function s_fwd(lp, xy) {
    var cot, E;
    if (fabs(lp.phi) <= TOL) {
      xy.x = lp.lam;
      xy.y = ml0;
    } else {
      cot = 1 / tan(lp.phi);
      xy.x = sin(E = lp.lam * sin(lp.phi)) * cot;
      xy.y = lp.phi - P.phi0 + cot * (1 - cos(E));
    }
  }

  function s_inv(xy, lp) {
    var B, dphi, tp, i;
    if (fabs(xy.y = P.phi0 + xy.y) <= TOL) {
      lp.lam = xy.x;
      lp.phi = 0;
    } else {
      lp.phi = xy.y;
      B = xy.x * xy.x + xy.y * xy.y;
      i = N_ITER;
      do {
        tp = tan(lp.phi);
        lp.phi -= (dphi = (xy.y * (lp.phi * tp + 1) - lp.phi -
          0.5 * ( lp.phi * lp.phi + B) * tp) /
          ((lp.phi - xy.y) / tp - 1));
      } while (fabs(dphi) > CONV && --i);
      if (!i) i_error();
      lp.lam = asin(xy.x * tan(lp.phi)) / sin(lp.phi);
    }
  }
}
