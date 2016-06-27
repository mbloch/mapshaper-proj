/* @requires pj_gauss */

pj_add(pj_sterea, 'sterea', 'Oblique Stereographic Alternative', '\n\tAzimuthal, Sph&Ell');

function pj_sterea(P) {
  var en = pj_gauss_ini(P.e, P.phi0),
      phic0 = en.chi,
      R = en.rc,
      R2 = 2 * R,
      sinc0 = sin(phic0),
      cosc0 = cos(phic0);

  P.fwd = e_fwd;
  P.inv = e_inv;

  function e_fwd(lp, xy) {
    var cosc, sinc, cosl, k;
    lp = pj_gauss(lp, en);
    sinc = sin(lp.phi);
    cosc = cos(lp.phi);
    cosl = cos(lp.lam);
    k = P.k0 * R2 / (1 + sinc0 * sinc + cosc0 * cosc * cosl);
    xy.x = k * cosc * sin(lp.lam);
    xy.y = k * (cosc0 * sinc - sinc0 * cosc * cosl);
  }

  function e_inv(xy, lp) {
    var x = xy.x / P.k0,
        y = xy.y / P.k0,
        rho, c, sinc, cosc;
    if ((rho = hypot(x, y))) {
      c = 2 * atan2(rho, R2);
      sinc = sin(c);
      cosc = cos(c);
      lp.phi = asin(cosc * sinc0 + y * sinc * cosc0 / rho);
      lp.lam = atan2(x * sinc, rho * cosc0 * cosc - y * sinc0 * sinc);
    } else {
      lp.phi = phic0;
      lp.lam = 0;
    }
    pj_inv_gauss(lp, en);
  }
}
