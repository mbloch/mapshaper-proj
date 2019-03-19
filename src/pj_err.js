/* @requires pj_ctx, pj_strerrno */

// see pj_transform.c CHECK_RETURN()
function check_fatal_error() {
  var code = ctx.last_errno;
  if (!code) return;
  if (code > 0 || !is_transient_error(code)) {
    e_error(code);
  } else {
    // transient error
    // TODO: consider a strict mode that throws an error
  }
}

function is_transient_error(code) {
  return transient_error.indexOf(code) > -1;
}

var transient_error = [-14, -15, -17, -18, -19, -20, -27, -48];

function pj_ctx_set_errno(code) {
  ctx.last_errno = code;
}

function f_error() {
  pj_ctx_set_errno(-20);
}

function i_error() {
  pj_ctx_set_errno(-20);
}

function error_msg(code) {
  return pj_err_list[~code] || "unknown error";
}

// alias for e_error()
function error(code) {
  e_error(code);
}

// a fatal error
// see projects.h E_ERROR macro
function e_error(code) {
  pj_ctx_set_errno(code);
  fatal();
}

function fatal(msg, o) {
  if (!o) o = {};
  if (!o.code) o.code = ctx.last_errno || 0;
  if (!msg) msg = error_msg(o.code);
  // reset error code, so processing can continue after this error is handled
  ctx.last_errno = 0;
  throw new ProjError(msg, o);
}

function ProjError(msg, o) {
  var err = new Error(msg);
  err.name = 'ProjError';
  Object.keys(o).forEach(function(k) {
    err[k] = o[k];
  });
  return err;
}
