/* @requires pj_err */

// Convert a formatted value in DMS or decimal degrees to radians
function dmstor(str) {
  return dmstod(str) * DEG_TO_RAD;
}

function dmstod(str) {
  var match = /(-?[0-9.]+)d?([0-9.]*)'?([0-9.]*)"?([nsew]?)$/i.exec(str);
  var d = NaN;
  var deg, min, sec;
  if (match) {
    deg = match[1] || '0';
    min = match[2] || '0';
    sec = match[3] || '0';
    d = Number(deg) + Number(min) / 60 + Number(sec) / 3600;
    if (/[ws]/i.test(match[4])) {
      d = -d;
    }
  }
  if (isNaN(d)) {
    // throw an exception instead of just setting an error code
    // (assumes this function is called by pj_init() or a cli program,
    // where an exception is more appropriate)
    e_error(-16);
    // pj_ctx_set_errno(-16);
    // d = HUGE_VAL;
  }
  return d;
}
