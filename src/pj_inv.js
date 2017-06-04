/* @requires adjlon */

function pj_inv_deg(xy, P) {
  var lp = pj_inv(xy, P);
  return {
    lam: lp.lam * RAD_TO_DEG,
    phi: lp.phi * RAD_TO_DEG
  };
}

function pj_inv(xy, P) {
  var EPS = 1e-12;
  var lp = {lam: 0, phi: 0};

  // if (xy.x == HUGE_VAL || xy.y == HUGE_VAL) {
  if (!(xy.x < HUGE_VAL && xy.y < HUGE_VAL)) { // catch NaNs
    pj_ctx_set_errno(-15);
  } else {
    ctx.last_errno = 0;
    if (P.inv) {
      xy.x = (xy.x * P.to_meter - P.x0) * P.ra;
      xy.y = (xy.y * P.to_meter - P.y0) * P.ra;
      P.inv(xy, lp);
      lp.lam += P.lam0;
      if (!P.over) {
        lp.lam = adjlon(lp.lam);
      }
      if (P.geoc && fabs(fabs(lp.phi) - M_HALFPI) > EPS) {
        lp.phi = atan(P.one_es * tan(lp.phi));
      }
    } else {
      lp.lam = lp.phi = HUGE_VAL;
    }
  }
  if (ctx.last_errno || !isFinite(lp.lam) || !isFinite(lp.phi)) {
    // isFinite() catches NaN and +/- Infinity but not null
    lp.lam = lp.phi = HUGE_VAL;
  }
  return lp;
}
