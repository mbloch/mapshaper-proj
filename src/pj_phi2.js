/* @requires pj_ctx */

function pj_phi2(ts, e) {
  var N_ITER = 15,
      TOL = 1e-10,
      eccnth = 0.5 * e,
      Phi = M_HALFPI - 2 * Math.atan(ts),
      i = N_ITER,
      con, dphi;

  do {
    con = e * Math.sin(Phi);
    dphi = M_HALFPI - 2 * Math.atan(ts * Math.pow((1 - con) /
       (1 + con), eccnth)) - Phi;
    Phi += dphi;
  } while ( Math.abs(dphi) > TOL && --i);
  if (i <= 0) {
    pj_ctx_set_errno(-18);
  }
  return Phi;
}
