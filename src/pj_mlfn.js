
function pj_enfn(es) {
  var C00 = 1,
      C02 = 0.25,
      C04 = 0.046875,
      C06 = 0.01953125,
      C08 = 0.01068115234375,
      C22 = 0.75,
      C44 = 0.46875,
      C46 = 0.01302083333333333333,
      C48 = 0.00712076822916666666,
      C66 = 0.36458333333333333333,
      C68 = 0.00569661458333333333,
      C88 = 0.3076171875;
  var en = [], t;
  en[0] = C00 - es * (C02 + es * (C04 + es * (C06 + es * C08)));
  en[1] = es * (C22 - es * (C04 + es * (C06 + es * C08)));
  en[2] = (t = es * es) * (C44 - es * (C46 + es * C48));
  en[3] = (t *= es) * (C66 - es * C68);
  en[4] = t * es * C88;
  return en;
}

function pj_mlfn(phi, sphi, cphi, en) {
  cphi *= sphi;
  sphi *= sphi;
  return (en[0] * phi - cphi * (en[1] + sphi*(en[2] + sphi*(en[3] + sphi*en[4]))));
}

function pj_inv_mlfn(arg, es, en) {
  var EPS = 1e-11,
      MAX_ITER = 10,
      EN_SIZE = 5;

  var k = 1 / (1 - es),
      s, t, phi;

  phi = arg;
  for (var i = MAX_ITER; i>0; --i) { /* rarely goes over 2 iterations */
    s = sin(phi);
    t = 1 - es * s * s;
    phi -= t = (pj_mlfn(phi, s, cos(phi), en) - arg) * (t * sqrt(t)) * k;
    if (fabs(t) < EPS) {
      return phi;
    }
  }
  pj_ctx_set_errno( ctx, -17 );
  return phi;
}
