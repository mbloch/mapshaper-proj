/* @requires adjlon */

function pj_fwd_deg(lp, P) {
  var lp2 = {lam: lp.lam * DEG_TO_RAD, phi: lp.phi * DEG_TO_RAD};
  return pj_fwd(lp2, P);
}

function pj_fwd(lp, P) {
  var xy = {x: 0, y: 0};
  var EPS = 1e-12;
  var t = fabs(lp.phi) - M_HALFPI;

  // if (t > EPS || fabs(lp.lam) > 10) {
  if (!(t <= EPS && fabs(lp.lam) <= 10)) { // catch NaNs
    pj_ctx_set_errno(-14);
  } else {
    ctx.last_errno = 0; // clear a previous error
    if (fabs(t) <= EPS) {
      lp.phi = lp.phi < 0 ? -M_HALFPI : M_HALFPI;
    } else if (P.geoc) {
      lp.phi = atan(P.rone_es * tan(lp.phi));
    }
    lp.lam -= P.lam0;
    if (!P.over) {
      lp.lam = adjlon(lp.lam);
    }
    if (P.fwd) {
      P.fwd(lp, xy);
      xy.x = P.fr_meter * (P.a * xy.x + P.x0);
      xy.y = P.fr_meter * (P.a * xy.y + P.y0);
    } else {
      xy.x = xy.y = HUGE_VAL;
    }
  }
  if (ctx.last_errno || !isFinite(xy.x) || !isFinite(xy.y)) {
    // isFinite() catches NaN and +/- Infinity but not null
    xy.x = xy.y = HUGE_VAL;
  }
  return xy;
}
