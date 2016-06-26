/* @requires pj_const */


function get_rtodms(decimals, fixedWidth, pos, neg) {
  var dtodms = get_dtodms(decimals, fixedWidth, pos, neg);
  return function(r) {
    return dtodms(r * RAD_TO_DEG);
  };
}

// returns function for formatting as DMS
// See Proj.4 rtodms.c
// @pos: 'N' or 'E'
// @neg: 'S' or 'W'
function get_dtodms(decimals, fixedWidth, pos, neg) {
  var RES, CONV, i;
  if (decimals < 0 || decimals >= 9) {
    decimals = 3;
  }
  RES = 1;
  for (i=0; i<decimals; i++) {
    RES *= 10;
  }
  CONV = 3600 * RES;

  return function(r) {
    var sign = '',
        mstr = '',
        sstr = '',
        min, sec, suff, dstr;
    if (r === HUGE_VAL || isNaN(r)) return '';
    if (r < 0) {
      r = -r;
      suff = neg || '';
      if (!suff) {
        sign = '-';
      }
    } else {
      suff = pos || '';
    }
    r = floor(r * CONV + 0.5);
    sec = (r / RES) % 60;
    r = floor(r / (RES * 60));
    min = r % 60;
    dstr = floor(r / 60) + 'd';
    sstr = sec.toFixed(decimals);
    sec = parseFloat(sstr);
    if (sec) {
      sstr = (fixedWidth ? sstr : String(sec)) + '"';
    } else {
      sstr = '';
    }
    if (sec || min) {
      mstr = String(min) + "'";
      if (mstr.length == 2 && fixedWidth) {
        mstr = '0' + mstr;
      }
    }
    return sign + dstr + mstr + sstr + suff;
  };
}
