/* @requires aasincos */

pj_add(pj_somerc, 'somerc', 'Swiss. Obl. Mercator', '\n\tCyl, Ell\n\tFor CH1903');

function pj_somerc(P) {
  var K, c, hlf_e, kR, cosp0, sinp0;
  var EPS = 1.e-10;
  var NITER = 6;
  var cp, phip0, sp;
  hlf_e = 0.5 * P.e;
  cp = cos (P.phi0);
  cp *= cp;
  c = sqrt (1 + P.es * cp * cp * P.rone_es);
  sp = sin (P.phi0);
  cosp0 = cos(phip0 = aasin(sinp0 = sp / c));
  sp *= P.e;
  K = log (tan(M_FORTPI + 0.5 * phip0)) - c * (
      log (tan(M_FORTPI + 0.5 * P.phi0)) - hlf_e *
      log ((1 + sp) / (1 - sp)));
  kR = P.k0 * sqrt(P.one_es) / (1 - sp * sp);
  P.inv = e_inv;
  P.fwd = e_fwd;

  function e_fwd(lp, xy) {
    var phip, lamp, phipp, lampp, sp, cp;
    sp = P.e * sin(lp.phi);
    phip = 2* atan(exp(c * (log(tan(M_FORTPI + 0.5 * lp.phi)) -
        hlf_e * log((1 + sp)/(1 - sp))) + K)) - M_HALFPI;
    lamp = c * lp.lam;
    cp = cos(phip);
    phipp = aasin(cosp0 * sin(phip) - sinp0 * cp * cos(lamp));
    lampp = aasin(cp * sin(lamp) / cos(phipp));
    xy.x = kR * lampp;
    xy.y = kR * log(tan(M_FORTPI + 0.5 * phipp));
  }

  function e_inv(xy, lp) {
    var phip, lamp, phipp, lampp, cp, esp, con, delp;
    var i;
    phipp = 2 * (atan(exp(xy.y / kR)) - M_FORTPI);
    lampp = xy.x / kR;
    cp = cos (phipp);
    phip = aasin(cosp0 * sin(phipp) + sinp0 * cp * cos(lampp));
    lamp = aasin(cp * sin(lampp) / cos(phip));
    con = (K - log(tan(M_FORTPI + 0.5 * phip)))/c;
    for (i = NITER; i; --i) {
      esp = P.e * sin(phip);
      delp = (con + log(tan(M_FORTPI + 0.5 * phip)) - hlf_e *
        log((1 + esp)/(1 - esp))) * (1 - esp * esp) * cos(phip) * P.rone_es;
      phip -= delp;
      if (fabs(delp) < EPS)
        break;
    }
    if (i) {
      lp.phi = phip;
      lp.lam = lamp / c;
    } else
      i_error();
  }
}
