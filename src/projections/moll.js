/* @requires aasincos */

pj_add(pj_moll, 'moll', 'Mollweide', 'PCyl Sph');
pj_add(pj_wag4, 'wag4', 'Wagner IV', 'PCyl Sph');
pj_add(pj_wag5, 'wag5', 'Wagner V', 'PCyl Sph');

function pj_moll(P) {
  pj_moll_init(P, pj_moll_init_Q(P, M_HALFPI));
}

function pj_wag4(P) {
  pj_moll_init(P, pj_moll_init_Q(P, M_PI/3));
}

function pj_wag5(P) {
  var Q = {
    C_x: 0.90977,
    C_y: 1.65014,
    C_p: 3.00896
  };
  pj_moll_init(P, Q);
}

function pj_moll_init_Q(P, p) {
  var sp = sin(p),
      p2 = p + p,
      r = sqrt(M_TWOPI * sp / (p2 + sin(p2)));
  return {
    C_x: 2 * r / M_PI,
    C_y: r / sp,
    C_p: p2 + sin(p2),
    mollweide: p == M_HALFPI // the poles need the special handling below
  };
}

// Mollweide close to the poles. With theta = (pi - s) / 2 and chi the
// colatitude, 2 * theta + sin(2 * theta) = pi * sin(phi) becomes
// s - sin(s) = 2 * pi * sin(chi / 2)^2, which can be solved accurately where
// the Newton iteration on theta converges only linearly.
function pj_moll_polar_s(chi) {
  var sh = sin(0.5 * chi);
  var w = 2 * M_PI * sh * sh;
  var s = Math.cbrt(6 * w); // <= the root, as s - sin(s) <= s^3 / 6
  var i, sh2, d, ds;
  for (i = 0; i < 20; ++i) {
    sh2 = sin(0.5 * s);
    d = 2 * sh2 * sh2; // 1 - cos(s)
    if (d === 0) break;
    ds = (pj_s_minus_sin_s(s) - w) / d;
    s -= ds;
    if (fabs(ds) <= 1e-12 * s) break; // quadratic convergence
  }
  return s;
}

function pj_moll_init(P, Q) {
  var MAX_ITER = 10,
      LOOP_TOL = 1e-7;
  P.fwd = s_fwd;
  P.inv = s_inv;
  P.es = 0;

  function s_fwd(lp, xy) {
    var k, V, i, s;
    if (Q.mollweide && fabs(lp.phi) > M_HALFPI - 0.5) {
      s = pj_moll_polar_s(M_HALFPI - fabs(lp.phi));
      // cos(theta) = sin(s / 2), sin(theta) = cos(s / 2)
      xy.x = Q.C_x * lp.lam * sin(0.5 * s);
      xy.y = (lp.phi < 0 ? -1 : 1) * Q.C_y * cos(0.5 * s);
      return;
    }
    k = Q.C_p * sin(lp.phi);
    for (i = MAX_ITER; i;--i) {
      lp.phi -= V = (lp.phi + sin(lp.phi) - k) /
        (1 + cos(lp.phi));
      if (fabs(V) < LOOP_TOL)
        break;
    }
    if (!i)
      lp.phi = (lp.phi < 0) ? -M_HALFPI : M_HALFPI;
    else
      lp.phi *= 0.5;
    xy.x = Q.C_x * lp.lam * cos(lp.phi);
    xy.y = Q.C_y * sin(lp.phi);
  }

  function s_inv(xy, lp) {
    var half_s, den, chi;
    if (Q.mollweide && fabs(xy.y) > 0.5 * Q.C_y && fabs(xy.y) <= Q.C_y) {
      // Close to the poles: cos(s / 2) = |y| / C_y, with s as in
      // pj_moll_polar_s(), and the colatitude chi from
      // 2 * sin(chi / 2)^2 = (s - sin(s)) / pi
      half_s = 2 * asin(sqrt(0.5 * (Q.C_y - fabs(xy.y)) / Q.C_y));
      den = Q.C_x * sin(half_s);
      lp.lam = den === 0 ? 0 : xy.x / den; // at the pole x is 0
      // On the outline lam can round to slightly more than pi. Here it comes
      // from C_y - |y|, whose rounding grows like C_y / (C_y - |y|) close to
      // the poles: accept that much too
      var tol = 4 * 2.220446049250313e-16 * (1 + Q.C_y / (Q.C_y - fabs(xy.y)));
      if (fabs(lp.lam) - M_PI < EPS10 || fabs(lp.lam) <= M_PI * (1 + tol)) {
        // clamp, so that a longitude rounded past +/-pi on the outline does
        // not wrap to the other side of the map
        if (fabs(lp.lam) > M_PI) lp.lam = lp.lam < 0 ? -M_PI : M_PI;
        chi = 2 * asin(sqrt(pj_s_minus_sin_s(2 * half_s) / (2 * M_PI)));
        lp.phi = (xy.y < 0 ? -1 : 1) * (M_HALFPI - chi);
      } else {
        lp.lam = lp.phi = HUGE_VAL;
      }
      return;
    }
    lp.phi = aasin(xy.y / Q.C_y);
    lp.lam = xy.x / (Q.C_x * cos(lp.phi));
    // if (fabs(lp.lam) < M_PI) { // from Proj.4; fails for edge coordinates
    if (fabs(lp.lam) - M_PI < EPS10) { // allows inv projection of world layer
      if (fabs(lp.lam) > M_PI) lp.lam = lp.lam < 0 ? -M_PI : M_PI; // do not wrap
      lp.phi += lp.phi;
      lp.phi = aasin((lp.phi + sin(lp.phi)) / Q.C_p);
    } else {
      lp.lam = lp.phi = HUGE_VAL;
    }
  }
}
