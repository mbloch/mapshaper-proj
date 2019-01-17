
/*
  Created by Jacques Bertin in 1953, this projection was the go-to choice
  of the French cartographic school when they wished to represent phenomena
  on a global scale.

  Formula designed by Philippe Rivière, 2017.
  https://visionscarto.net/bertin-projection-1953
  Port to PROJ by Philippe Rivière, 21 September 2018
  Port to JavaScript by Matthew Bloch October 2018
*/
pj_add(pj_bertin1953, 'bertin1953', 'Bertin 1953', "\n\tMisc Sph no inv.");

function pj_bertin1953(P) {
  var cos_delta_phi, sin_delta_phi, cos_delta_gamma, sin_delta_gamma;

  P.es = 0;
  P.fwd = s_fwd;
  P.lam0 = 0;
  P.phi0 = DEG_TO_RAD * -42;

  cos_delta_phi = cos(P.phi0);
  sin_delta_phi = sin(P.phi0);
  cos_delta_gamma = 1;
  sin_delta_gamma = 0;

  function s_fwd(lp, xy) {
    var fu = 1.4, k = 12, w = 1.68, d;
    /* Rotate */
    var cosphi, x, y, z, z0;
    lp.lam += DEG_TO_RAD * -16.5;
    cosphi = cos(lp.phi);
    x = cos(lp.lam) * cosphi;
    y = sin(lp.lam) * cosphi;
    z = sin(lp.phi);
    z0 = z * cos_delta_phi + x * sin_delta_phi;
    lp.lam = atan2(y * cos_delta_gamma - z0 * sin_delta_gamma,
       x * cos_delta_phi - z * sin_delta_phi);
    z0 = z0 * cos_delta_gamma + y * sin_delta_gamma;
    lp.phi = asin(z0);
    lp.lam = adjlon(lp.lam);

    /* Adjust pre-projection */
    if (lp.lam + lp.phi < -fu) {
      d = (lp.lam - lp.phi + 1.6) * (lp.lam + lp.phi + fu) / 8;
      lp.lam += d;
      lp.phi -= 0.8 * d * sin(lp.phi + M_PI / 2);
    }

    /* Project with Hammer (1.68,2) */
    cosphi = cos(lp.phi);
    d = sqrt(2/(1 + cosphi * cos(lp.lam / 2)));
    xy.x = w * d * cosphi * sin(lp.lam / 2);
    xy.y = d * sin(lp.phi);

    /* Adjust post-projection */
    d = (1 - cos(lp.lam * lp.phi)) / k;
    if (xy.y < 0) {
      xy.x *= 1 + d;
    }
    if (xy.y > 0) {
      xy.x *= 1 + d / 1.5 * xy.x * xy.x;
    }

    return xy;
  }
}
