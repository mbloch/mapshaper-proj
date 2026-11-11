/* @requires aasincos */

pj_add(pj_putp2, 'putp2', 'Putnins P2', 'PCyl., Sph.');

function pj_putp2(P) {
  var C_x = 1.89490,
      C_y = 1.71848,
      C_p = 0.6141848493043784,
      EPS = 1e-10,
      NITER = 10,
      PI_DIV_3 = 1.0471975511965977;
  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  // Close to the poles, where theta tends to pi/3 and the Newton iteration
  // converges only linearly: with theta = pi/3 - t and
  // F(theta) = theta + sin(theta) * (cos(theta) - 1), so that C_p = F(pi/3),
  // F(pi/3) - F(pi/3 - t) = t + cos(2pi/3 - t) * sin(t)
  //                         - 2 * cos(pi/3 - t/2) * sin(t/2)
  function polar_d(t) {
    return t + cos(2 * PI_DIV_3 - t) * sin(t) -
      2 * cos(PI_DIV_3 - 0.5 * t) * sin(0.5 * t);
  }

  function s_fwd(lp, xy) {
    var p, c, s, V, i, sh, w, t, d, dt;
    if (fabs(lp.phi) > M_HALFPI - 0.1) {
      // solve F(pi/3) - F(pi/3 - t) = C_p * (1 - sin|phi|) = 2 * C_p * sin(chi / 2)^2
      sh = sin(0.5 * (M_HALFPI - fabs(lp.phi)));
      w = 2 * C_p * sh * sh;
      t = sqrt(w / (0.25 * sqrt(3))); // D(t) ~ sqrt(3)/4 * t^2
      for (i = 0; i < 30; ++i) {
        // D'(t) = cos(theta) * (2 * cos(theta) - 1),
        // with 2 * cos(theta) - 1 = 4 * sin(pi/3 - t/2) * sin(t/2)
        d = cos(PI_DIV_3 - t) * 4 * sin(PI_DIV_3 - 0.5 * t) * sin(0.5 * t);
        if (d === 0) break;
        dt = (polar_d(t) - w) / d;
        t -= dt;
        if (t < 0) t = 0;
        // D(t) carries a rounding error of about eps * t, so also stop on an absolute step
        if (fabs(dt) <= 1e-12 * t || fabs(dt) < 1e-15) break;
      }
      // cos(theta) - 1/2 = 2 * sin(pi/3 - t/2) * sin(t/2)
      xy.x = C_x * lp.lam * 2 * sin(PI_DIV_3 - 0.5 * t) * sin(0.5 * t);
      xy.y = (lp.phi < 0 ? -1 : 1) * C_y * sin(PI_DIV_3 - t);
      return;
    }
    p = C_p * sin(lp.phi);
    s = lp.phi * lp.phi;
    lp.phi *= 0.615709 + s * ( 0.00909953 + s * 0.0046292 );
    for (i = NITER; i ; --i) {
      c = cos(lp.phi);
      s = sin(lp.phi);
      lp.phi -= V = (lp.phi + s * (c - 1) - p) /
        (1 + c * (c - 1) - s * s);
      if (fabs(V) < EPS)
        break;
    }
    if (!i)
      lp.phi = lp.phi < 0 ? - PI_DIV_3 : PI_DIV_3;
    xy.x = C_x * lp.lam * (cos(lp.phi) - 0.5);
    xy.y = C_y * sin(lp.phi);
  }

  function s_inv(xy, lp) {
    var c, theta, t, den;
    theta = aasin(xy.y / C_y);
    if (fabs(theta) > PI_DIV_3 - 0.5) {
      // Close to the poles: theta = +/-(pi/3 - t), with the colatitude chi
      // from 2 * C_p * sin(chi / 2)^2 = F(pi/3) - F(pi/3 - t)
      t = PI_DIV_3 - fabs(theta);
      if (t < 0) t = 0;
      den = C_x * 2 * sin(PI_DIV_3 - 0.5 * t) * sin(0.5 * t);
      lp.lam = den === 0 ? 0 : xy.x / den;
      lp.phi = (xy.y < 0 ? -1 : 1) * (M_HALFPI - 2 * asin(sqrt(0.5 * polar_d(t) / C_p)));
      return;
    }
    lp.phi = aasin(xy.y / C_y);
    lp.lam = xy.x / (C_x * ((c = cos(lp.phi)) - 0.5));
    lp.phi = aasin((lp.phi + sin(lp.phi) * (c - 1)) / C_p);
  }
}
