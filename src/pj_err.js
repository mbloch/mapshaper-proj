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
  fatal(error_msg(code), code);
}

function fatal(msg, code) {
  throw new PJError(msg, code);
  // process.exit(1);
}

function PJError(msg, code) {
  var err = new Error(msg);
  err.name = 'PJError';
  err.code = code || 0;
  return err;
}
