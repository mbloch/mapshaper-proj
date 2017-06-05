pj_add(pj_krovak, 'krovak', 'Krovak', '\n\tPCyl., Ellps.');

function pj_krovak(P) {
  var u0, n0, g;
  var alpha, k, n, rho0, ad, czech;
  var EPS = 1e-15;
  var S45 = 0.785398163397448; /* 45 deg */
  var S90 = 1.570796326794896; /* 90 deg */
  var UQ = 1.04216856380474;   /* DU(2, 59, 42, 42.69689) */
  var S0 = 1.37008346281555;   /* Latitude of pseudo standard parallel 78deg 30'00" N */

  /* we want Bessel as fixed ellipsoid */
  P.a = 6377397.155;
  P.e = sqrt(P.es = 0.006674372230614);

  /* if latitude of projection center is not set, use 49d30'N */
  if (!pj_param(P.params, "tlat_0"))
    P.phi0 = 0.863937979737193;

  /* if center long is not set use 42d30'E of Ferro - 17d40' for Ferro */
  /* that will correspond to using longitudes relative to greenwich    */
  /* as input and output, instead of lat/long relative to Ferro */
  if (!pj_param(P.params, "tlon_0"))
          P.lam0 = 0.7417649320975901 - 0.308341501185665;

  /* if scale not set default to 0.9999 */
  if (!pj_param(P.params, "tk"))
          P.k0 = 0.9999;
  czech = 1;
  if (!pj_param(P.params, "tczech"))
    czech = -1;

  /* Set up shared parameters between forward and inverse */
  alpha = sqrt(1 + (P.es * pow(cos(P.phi0), 4)) / (1 - P.es));
  u0 = asin(sin(P.phi0) / alpha);
  g = pow((1 + P.e * sin(P.phi0)) / (1 - P.e * sin(P.phi0)), alpha * P.e / 2);
  k = tan( u0 / 2 + S45) / pow  (tan(P.phi0 / 2 + S45) , alpha) * g;
  n0 = sqrt(1 - P.es) / (1 - P.es * pow(sin(P.phi0), 2));
  n = sin(S0);
  rho0 = P.k0 * n0 / tan(S0);
  ad = S90 - UQ;
  P.inv = e_inv;
  P.fwd = e_fwd;

  function e_fwd(lp, xy) {
    var gfi, u, deltav, s, d, eps, rho;

    gfi = pow ( (1 + P.e * sin(lp.phi)) / (1 - P.e * sin(lp.phi)), alpha * P.e / 2);

    u = 2 * (atan(k * pow( tan(lp.phi / 2 + S45), alpha) / gfi)-S45);
    deltav = -lp.lam * alpha;

    s = asin(cos(ad) * sin(u) + sin(ad) * cos(u) * cos(deltav));
    d = asin(cos(u) * sin(deltav) / cos(s));
    eps = n * d;
    rho = rho0 * pow(tan(S0 / 2 + S45) , n) / pow(tan(s / 2 + S45) , n);
    xy.y = rho * cos(eps);
    xy.x = rho * sin(eps);
    xy.y *= czech;
    xy.x *= czech;
  }

  function e_inv(xy, lp) {
    var u, deltav, s, d, eps, rho, fi1, xy0;
    var ok;
    xy0 = xy.x;
    xy.x = xy.y;
    xy.y = xy0;
    xy.x *= czech;
    xy.y *= czech;

    rho = sqrt(xy.x * xy.x + xy.y * xy.y);
    eps = atan2(xy.y, xy.x);
    d = eps / sin(S0);
    s = 2 * (atan(  pow(rho0 / rho, 1 / n) * tan(S0 / 2 + S45)) - S45);
    u = asin(cos(ad) * sin(s) - sin(ad) * cos(s) * cos(d));
    deltav = asin(cos(s) * sin(d) / cos(u));
    lp.lam = P.lam0 - deltav / alpha;

    /* ITERATION FOR lp.phi */
    fi1 = u;
    ok = 0;
    do {
      lp.phi = 2 * (atan(pow( k, -1 / alpha) * pow( tan(u / 2 + S45), 1 / alpha) *
        pow( (1 + P.e * sin(fi1)) / (1 - P.e * sin(fi1)) , P.e / 2))  - S45);
      if (fabs(fi1 - lp.phi) < EPS) ok=1;
      fi1 = lp.phi;
   } while (ok===0);
   lp.lam -= P.lam0;
  }
}
