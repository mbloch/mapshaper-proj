
function aasin(v) {
  var ONE_TOL = 1.00000000000001;
  var av = fabs(v);
  if (av >= 1) {
    if (av > ONE_TOL) pj_ctx_set_errno(-19);
    return v < 0 ? -M_HALFPI : M_HALFPI;
  }
  return asin(v);
}

function aacos(v) {
  var ONE_TOL = 1.00000000000001;
  var av = fabs(v);
  if (av >= 1) {
    if (av > ONE_TOL) pj_ctx_set_errno(-19);
    return (v < 0 ? M_PI : 0);
  }
  return acos(v);
}

function asqrt(v) { return ((v <= 0) ? 0 : sqrt(v)); }

function aatan2(n, d) {
  var ATOL = 1e-50;
  return ((fabs(n) < ATOL && fabs(d) < ATOL) ? 0 : atan2(n,d));
}

// s - sin(s), accurate also for small |s|, where the subtraction would lose
// most of the digits
function pj_s_minus_sin_s(s) {
  if (fabs(s) < 0.25) {
    var s2 = s * s;
    return s * s2 * (1 / 6 - s2 * (1 / 120 - s2 * (1 / 5040 - s2 * (1 / 362880 -
      s2 * (1 / 39916800 - s2 * (1 / 6227020800))))));
  }
  return s - sin(s);
}
