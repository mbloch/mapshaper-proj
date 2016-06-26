
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
