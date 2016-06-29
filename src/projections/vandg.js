pj_add(pj_vandg, 'vandg', 'van der Grinten (I)', '\n\tMisc Sph');
pj_add(pj_vandg2, 'vandg2', 'van der Grinten II', '\n\tMisc Sph, no inv.');
pj_add(pj_vandg3, 'vandg3', 'van der Grinten III', '\n\tMisc Sph, no inv.');
pj_add(pj_vandg4, 'vandg4', 'van der Grinten IV', '\n\tMisc Sph, no inv.');

function pj_vandg(P) {
  var TOL = 1.e-10,
      THIRD = 0.33333333333333333333,
      TWO_THRD = 0.66666666666666666666,
      C2_27 = 0.07407407407407407407,
      PI4_3 = 4.18879020478639098458,
      PISQ = 9.86960440108935861869,
      TPISQ = 19.73920880217871723738,
      HPISQ = 4.93480220054467930934;

  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    var al, al2, g, g2, p2;
    p2 = fabs(lp.phi / M_HALFPI);
    if ((p2 - TOL) > 1) f_error();
    if (p2 > 1)
      p2 = 1;
    if (fabs(lp.phi) <= TOL) {
      xy.x = lp.lam;
      xy.y = 0;
    } else if (fabs(lp.lam) <= TOL || fabs(p2 - 1) < TOL) {
      xy.x = 0;
      xy.y = M_PI * tan(0.5 * asin(p2));
      if (lp.phi < 0) xy.y = -xy.y;
    } else {
      al = 0.5 * fabs(M_PI / lp.lam - lp.lam / M_PI);
      al2 = al * al;
      g = sqrt(1 - p2 * p2);
      g = g / (p2 + g - 1);
      g2 = g * g;
      p2 = g * (2 / p2 - 1);
      p2 = p2 * p2;
      xy.x = g - p2; g = p2 + al2;
      xy.x = M_PI * (al * xy.x + sqrt(al2 * xy.x * xy.x - g * (g2 - p2))) / g;
      if (lp.lam < 0) xy.x = -xy.x;
      xy.y = fabs(xy.x / M_PI);
      xy.y = 1 - xy.y * (xy.y + 2 * al);
      if (xy.y < -TOL) f_error();
      if (xy.y < 0)
        xy.y = 0;
      else
        xy.y = sqrt(xy.y) * (lp.phi < 0 ? -M_PI : M_PI);
    }
  }

  function s_inv(xy, lp) {
    var t, c0, c1, c2, c3, al, r2, r, m, d, ay, x2, y2;
    x2 = xy.x * xy.x;
    if ((ay = fabs(xy.y)) < TOL) {
      lp.phi = 0;
      t = x2 * x2 + TPISQ * (x2 + HPISQ);
      lp.lam = fabs(xy.x) <= TOL ? 0 :
         0.5 * (x2 - PISQ + sqrt(t)) / xy.x;
      return (lp);
    }
    y2 = xy.y * xy.y;
    r = x2 + y2;    r2 = r * r;
    c1 = - M_PI * ay * (r + PISQ);
    c3 = r2 + M_TWOPI * (ay * r + M_PI * (y2 + M_PI * (ay + M_HALFPI)));
    c2 = c1 + PISQ * (r - 3 *  y2);
    c0 = M_PI * ay;
    c2 /= c3;
    al = c1 / c3 - THIRD * c2 * c2;
    m = 2 * sqrt(-THIRD * al);
    d = C2_27 * c2 * c2 * c2 + (c0 * c0 - THIRD * c2 * c1) / c3;
    if (((t = fabs(d = 3 * d / (al * m))) - TOL) <= 1) {
      d = t > 1 ? (d > 0 ? 0 : M_PI) : acos(d);
      lp.phi = M_PI * (m * cos(d * THIRD + PI4_3) - THIRD * c2);
      if (xy.y < 0) lp.phi = -lp.phi;
      t = r2 + TPISQ * (x2 - y2 + HPISQ);
      lp.lam = fabs(xy.x) <= TOL ? 0 :
         0.5 * (r - PISQ + (t <= 0 ? 0 : sqrt(t))) / xy.x;
    } else
        i_error();
  }
}

function pj_vandg2(P) {
  pj_vandg2_init(P, false);
}

function pj_vandg3(P) {
  pj_vandg2_init(P, true);
}

function pj_vandg2_init(P, vdg3) {
  var TOL = 1e-10;
  P.fwd = s_fwd;
  P.es = 0;

  function s_fwd(lp, xy) {
    var x1, at, bt, ct;
    bt = fabs(M_TWO_D_PI * lp.phi);
    if ((ct = 1 - bt * bt) < 0)
      ct = 0;
    else
      ct = sqrt(ct);
    if (fabs(lp.lam) < TOL) {
      xy.x = 0;
      xy.y = M_PI * (lp.phi < 0 ? -bt : bt) / (1 + ct);
    } else {
      at = 0.5 * fabs(M_PI / lp.lam - lp.lam / M_PI);
      if (vdg3) {
          x1 = bt / (1 + ct);
          xy.x = M_PI * (sqrt(at * at + 1 - x1 * x1) - at);
          xy.y = M_PI * x1;
      } else {
          x1 = (ct * sqrt(1 + at * at) - at * ct * ct) /
              (1 + at * at * bt * bt);
          xy.x = M_PI * x1;
          xy.y = M_PI * sqrt(1 - x1 * (x1 + 2 * at) + TOL);
      }
      if ( lp.lam < 0) xy.x = -xy.x;
      if ( lp.phi < 0) xy.y = -xy.y;
    }
  }
}

function pj_vandg4(P) {
  P.es = 0;
  P.fwd = function(lp, xy) {
    var TOL = 1e-10;
    var x1, t, bt, ct, ft, bt2, ct2, dt, dt2;
    if (fabs(lp.phi) < TOL) {
      xy.x = lp.lam;
      xy.y = 0;
    } else if (fabs(lp.lam) < TOL || fabs(fabs(lp.phi) - M_HALFPI) < TOL) {
      xy.x = 0;
      xy.y = lp.phi;
    } else {
      bt = fabs(M_TWO_D_PI * lp.phi);
      bt2 = bt * bt;
      ct = 0.5 * (bt * (8 - bt * (2 + bt2)) - 5) / (bt2 * (bt - 1));
      ct2 = ct * ct;
      dt = M_TWO_D_PI * lp.lam;
      dt = dt + 1 / dt;
      dt = sqrt(dt * dt - 4);
      if ((fabs(lp.lam) - M_HALFPI) < 0) dt = -dt;
      dt2 = dt * dt;
      x1 = bt + ct; x1 *= x1;
      t = bt + 3*ct;
      ft = x1 * (bt2 + ct2 * dt2 - 1) + (1-bt2) * (
          bt2 * (t * t + 4 * ct2) +
          ct2 * (12 * bt * ct + 4 * ct2) );
      x1 = (dt*(x1 + ct2 - 1) + 2*sqrt(ft)) /
          (4* x1 + dt2);
      xy.x = M_HALFPI * x1;
      xy.y = M_HALFPI * sqrt(1 + dt * fabs(x1) - x1 * x1);
      if (lp.lam < 0) xy.x = -xy.x;
      if (lp.phi < 0) xy.y = -xy.y;
    }
  };
}
