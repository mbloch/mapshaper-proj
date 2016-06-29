/* @requires aasincos */

pj_add(pj_chamb, 'chamb', 'Chamberlin Trimetric', '\n\tMisc Sph, no inv.\n\tlat_1= lon_1= lat_2= lon_2= lat_3= lon_3=');

function pj_chamb(P) {
  var THIRD  = 1/3,
      TOL = 1e-9,
      c = [],
      x0, y0,
      v, beta_0, beta_1, beta_2, i, j;

  for (i = 0; i < 3; ++i) { /* get control point locations */
    c[i] = {p: {}};
    c[i].phi = pj_param(P.params, 'rlat_' + (i+1));
    c[i].lam = pj_param(P.params, 'rlon_' + (i+1));
    c[i].lam = adjlon(c[i].lam - P.lam0);
    c[i].cosphi = cos(c[i].phi);
    c[i].sinphi = sin(c[i].phi);
  }
  for (i = 0; i < 3; ++i) { /* inter ctl pt. distances and azimuths */
    j = i == 2 ? 0 : i + 1;
    c[i].v = vect(c[j].phi - c[i].phi, c[i].cosphi, c[i].sinphi,
        c[j].cosphi, c[j].sinphi, c[j].lam - c[i].lam);

    if (!c[i].v.r) e_error(-25);
    /* co-linearity problem ignored for now */
  }
  beta_0 = lc(c[0].v.r, c[2].v.r, c[1].v.r);
  beta_1 = lc(c[0].v.r, c[1].v.r, c[2].v.r);
  beta_2 = M_PI - beta_0;
  y0 = 2 * (c[0].p.y = c[1].p.y = c[2].v.r * sin(beta_0));
  c[2].p.y = 0;
  c[0].p.x = -(c[1].p.x = 0.5 * c[0].v.r);
  x0 = c[2].p.x = c[0].p.x + c[2].v.r * cos(beta_0);

  P.es = 0;
  P.fwd = s_fwd;

  function s_fwd(lp, xy) {
    var sinphi, cosphi, a, i, j, x, y;
    var v = [];
    sinphi = sin(lp.phi);
    cosphi = cos(lp.phi);
    for (i = 0; i < 3; ++i) { /* dist/azimiths from control */
      v[i] = vect(lp.phi - c[i].phi, c[i].cosphi, c[i].sinphi,
          cosphi, sinphi, lp.lam - c[i].lam);
      if (!v[i].r)
          break;
      v[i].Az = adjlon(v[i].Az - c[i].v.Az);
    }
    if (i < 3) { /* current point at control point */
      x = c[i].p.x;
      y = c[i].p.y;
    } else { /* point mean of intercepts */
      x = x0;
      y = y0;
      for (i = 0; i < 3; ++i) {
        j = i == 2 ? 0 : i + 1;
        a = lc(c[i].v.r, v[i].r, v[j].r);
        if (v[i].Az < 0)
          a = -a;
        if (! i) { /* coord comp unique to each arc */
          x += v[i].r * cos(a);
          y -= v[i].r * sin(a);
        } else if (i == 1) {
          a = beta_1 - a;
          x -= v[i].r * cos(a);
          y -= v[i].r * sin(a);
        } else {
          a = beta_2 - a;
          x += v[i].r * cos(a);
          y += v[i].r * sin(a);
        }
      }
      x *= THIRD; /* mean of arc intercepts */
      y *= THIRD;
    }
    xy.x = x;
    xy.y = y;
  }

  function vect(dphi, c1, s1, c2, s2, dlam) {
    var v = {};
    var cdl, dp, dl;
    cdl = cos(dlam);
    if (fabs(dphi) > 1 || fabs(dlam) > 1)
      v.r = aacos(cs1 * s2 + c1 * c2 * cdl);
    else { /* more accurate for smaller distances */
      dp = sin(0.5 * dphi);
      dl = sin(0.5 * dlam);
      v.r = 2 * aasin(sqrt(dp * dp + c1 * c2 * dl * dl));
    }
    if (fabs(v.r) > TOL)
      v.Az = atan2(c2 * sin(dlam), c1 * s2 - s1 * c2 * cdl);
    else
      v.r = v.Az = 0;
    return v;
  }

  /* law of cosines */
  function lc(b, c, a) {
    return aacos(0.5 * (b * b + c * c - a * a) / (b * c));
  }
}
