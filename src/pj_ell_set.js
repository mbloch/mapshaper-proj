/* @requires pj_ellps */

function pj_ell_set(P) {
  var SIXTH = 0.1666666666666666667, /* 1/6 */
      RA4 = 0.04722222222222222222, /* 17/360 */
      RA6 = 0.02215608465608465608, /* 67/3024 */
      RV4 = 0.06944444444444444444, /* 5/72 */
      RV6 = 0.04243827160493827160; /* 55/1296 */
  var params = P.params;
  var a = 0;
  var es = 0;
  var name, ellps, tmp, b, i;
  if (pj_param(params, 'tR')) {
    a = pj_param(params, 'dR');
  } else {
    if (name = pj_param(params, 'sellps')) {
      ellps = find_ellps(name);
      if (!ellps) {
        error(-9);
      }
      pj_mkparam(params, ellps.major);
      pj_mkparam(params, ellps.ell);
    }
    a = pj_param(params, 'da');
    if (pj_param(params, 'tes')) {
      es = pj_param(params, 'des');
    } else if (pj_param(params, 'te')) {
      tmp = pj_param(params, 'de');
      es = tmp * tmp;
    } else if (pj_param(params, 'trf')) {
      tmp = pj_param(params, 'drf');
      if (!tmp) {
        error(-10);
      }
      tmp = 1 / tmp;
      es = tmp * (2 - tmp);
    } else if (pj_param(params, 'tf')) {
      tmp = pj_param(params, 'df');
      es = tmp * (2 - tmp);
    } else if (pj_param(params, 'tb')) {
      b = pj_param(params, 'db');
      es = 1 - (b * b) / (a * a);
    }
    if (!b) {
      b = a * sqrt(1 - es);
    }

    if (pj_param(params, 'bR_A')) {
      a *= 1 - es * (SIXTH + es * (RA4 + es * RA6));
      es = 0;
    } else if (pj_param(params, 'bR_V')) {
      a *= 1 - es * (SIXTH + es * (RV4 + es * RV6));
    } else if (pj_param(params, 'bR_a')) {
      a = 0.5 * (a + b);
      es = 0;
    } else if (pj_param(params, 'bR_g')) {
      a = sqrt(a * b);
      es = 0;
    } else if (pj_param(params, 'bR_h')) {
      if (a + b === 0) {
        error(-20);
      }
      a = 2 * a * b / (a + b);
      es = 0;
    } else if (i = pj_param(params, 'tR_lat_a') || pj_param(params, 'tR_lat_g')) {
      tmp = sin(pj_param(params, i ? 'rR_lat_a' : 'rR_lat_g'));
      if (fabs(tmp) > M_HALFPI) {
        error(-11);
      }
      tmp = 1 - es * tmp * tmp;
      a *= i ? 0.5 * (1 - es + tmp) / (tmp * sqrt(tmp)) : sqrt(1 - es) / tmp;
      es = 0;
    }
  }

  if (es < 0) error(-12);
  if (a <= 0) error(-13);
  P.es = es;
  P.a = a;
}
