pj_add(pj_hill, 'hill', 'Hill Eucyclic', 'PCyl., Sph., NoInv.');

// Adapted from: https://github.com/d3/d3-geo-projection/blob/master/src/hill.js
// License: https://github.com/d3/d3-geo-projection/blob/master/LICENSE

function pj_hill(P) {
  var K = 1, // TODO: expose as parameter
      L = 1 + K,
      sinBt = sin(1 / L),
      Bt = asin(sinBt),
      A = 2 * sqrt(M_PI / (B = M_PI + 4 * Bt * L)),
      B,
      rho0 = 0.5 * A * (L + sqrt(K * (2 + K))),
      K2 = K * K,
      L2 = L * L,
      EPS = 1e-12;

  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    var t = 1 - sin(lp.phi),
        rho, omega;
    if (t && t < 2) {
      var theta = M_HALFPI - lp.phi,
          i = 25,
          delta, sinTheta, cosTheta, C, Bt_Bt1;
      do {
        sinTheta = sin(theta);
        cosTheta = cos(theta);
        Bt_Bt1 = Bt + atan2(sinTheta, L - cosTheta);
        C = 1 + L2 - 2 * L * cosTheta;
        theta -= delta = (theta - K2 * Bt - L * sinTheta + C * Bt_Bt1 -0.5 * t * B) / (2 * L * sinTheta * Bt_Bt1);
      } while (fabs(delta) > EPS && --i > 0);
      rho = A * sqrt(C);
      omega = lp.lam * Bt_Bt1 / M_PI;
    } else {
      rho = A * (K + t);
      omega = lp.lam * Bt / M_PI;
    }

    xy.x = rho * sin(omega);
    xy.y = rho0 - rho * cos(omega);
  }

  function s_inv(xy, lp) {
    var x = xy.x,
        y = xy.y,
        rho2 = x * x + (y -= rho0) * y,
        cosTheta = (1 + L2 - rho2 / (A * A)) / (2 * L),
        theta = acos(cosTheta),
        sinTheta = sin(theta),
        Bt_Bt1 = Bt + atan2(sinTheta, L - cosTheta);
    lp.lam = asin(x / sqrt(rho2)) * M_PI / Bt_Bt1,
    lp.phi = asin(1 - 2 * (theta - K2 * Bt - L * sinTheta + (1 + L2 - 2 * L * cosTheta) * Bt_Bt1) / B);
  }
}
