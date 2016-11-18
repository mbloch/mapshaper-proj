/* @requires pj_mlfn aasincos Math Geodesic GeodesicLine */

pj_add(pj_aeqd, 'aeqd', 'Azimuthal Equidistant', '\n\tAzi, Sph&Ell\n\tlat_0 guam');

function pj_aeqd(P) {
  var EPS10 = 1.e-10,
      TOL = 1.e-14,
      N_POLE = 0,
      S_POLE = 1,
      EQUIT = 2,
      OBLIQ = 3;

  var sinph0, cosph0, M1, N1, Mp, He, G, mode, en, g;
  P.phi0 = pj_param(P.params, "rlat_0");
  if (fabs(fabs(P.phi0) - M_HALFPI) < EPS10) {
    mode = P.phi0 < 0 ? S_POLE : N_POLE;
    sinph0 = P.phi0 < 0 ? -1 : 1;
    cosph0 = 0;
  } else if (fabs(P.phi0) < EPS10) {
    mode = EQUIT;
    sinph0 = 0;
    cosph0 = 1;
  } else {
    mode = OBLIQ;
    sinph0 = sin(P.phi0);
    cosph0 = cos(P.phi0);
  }
  if (!P.es) {
    P.inv = s_inv;
    P.fwd = s_fwd;
  } else {
    g = new GeographicLib.Geodesic.Geodesic(P.a, P.es / (1 + sqrt(P.one_es)));
    en = pj_enfn(P.es);
    if (pj_param(P.params, "bguam")) {
      M1 = pj_mlfn(P.phi0, sinph0, cosph0, en);
      P.inv = e_guam_inv;
      P.fwd = e_guam_fwd;
    } else {
      switch (mode) {
        case N_POLE:
          Mp = pj_mlfn(M_HALFPI, 1, 0, en);
          break;
        case S_POLE:
          Mp = pj_mlfn(-M_HALFPI, -1, 0, en);
          break;
        case EQUIT:
        case OBLIQ:
          P.inv = e_inv;
          P.fwd = e_fwd;
          N1 = 1 / sqrt(1 - P.es * sinph0 * sinph0);
          G = sinph0 * (He = P.e / sqrt(P.one_es));
          He *= cosph0;
          break;
      }
      P.inv = e_inv;
      P.fwd = e_fwd;
    }
  }

  function e_fwd(lp, xy) {
    var coslam, cosphi, sinphi, rho;
    var azi1, azi2, s12;
    var lam1, phi1, lam2, phi2;
    var vars;

    coslam = cos(lp.lam);
    cosphi = cos(lp.phi);
    sinphi = sin(lp.phi);
    switch (mode) {
      case N_POLE:
        coslam = - coslam;
        /* falls through */
      case S_POLE:
        xy.x = (rho = fabs(Mp - pj_mlfn(lp.phi, sinphi, cosphi, en))) *
            sin(lp.lam);
        xy.y = rho * coslam;
        break;
      case EQUIT:
      case OBLIQ:
        if (fabs(lp.lam) < EPS10 && fabs(lp.phi - P.phi0) < EPS10) {
            xy.x = xy.y = 0;
            break;
        }
        phi1 = P.phi0 / DEG_TO_RAD; lam1 = P.lam0 / DEG_TO_RAD;
        phi2 = lp.phi / DEG_TO_RAD;  lam2 = (lp.lam+P.lam0) / DEG_TO_RAD;
        vars = g.Inverse(phi1, lam1, phi2, lam2, g.AZIMUTH); // , &s12, &azi1, &azi2);
        azi1 = vars.azi1 * DEG_TO_RAD;
        s12 = vars.s12;
        xy.x = s12 * sin(azi1) / P.a;
        xy.y = s12 * cos(azi1) / P.a;
        break;
    }
  }

  function e_inv(xy, lp) {
    var c, azi1, azi2, s12, x2, y2, lat1, lon1, lat2, lon2;
    var vars;
    if ((c = hypot(xy.x, xy.y)) < EPS10) {
      lp.phi = P.phi0;
      lp.lam = 0;
      return (lp);
    }
    if (mode == OBLIQ || mode == EQUIT) {
      x2 = xy.x * P.a;
      y2 = xy.y * P.a;
      lat1 = P.phi0 / DEG_TO_RAD;
      lon1 = P.lam0 / DEG_TO_RAD;
      azi1 = atan2(x2, y2) / DEG_TO_RAD;
      s12 = sqrt(x2 * x2 + y2 * y2);
      vars = g.Direct(lat1, lon1, azi1, s12, g.STANDARD); // , &lat2, &lon2, &azi2);
      lp.phi = vars.lat2 * DEG_TO_RAD;
      lp.lam = vars.lon2 * DEG_TO_RAD;
      lp.lam -= P.lam0;
    } else { /* Polar */
      lp.phi = pj_inv_mlfn(mode == N_POLE ? Mp - c : Mp + c,
          P.es, en);
      lp.lam = atan2(xy.x, mode == N_POLE ? -xy.y : xy.y);
    }
  }

  function s_fwd(lp, xy) {
    var coslam, cosphi, sinphi;
    sinphi = sin(lp.phi);
    cosphi = cos(lp.phi);
    coslam = cos(lp.lam);
    switch (mode) {
      case EQUIT:
      case OBLIQ:
        if (mode == EQUIT) {
          xy.y = cosphi * coslam;
        } else {
          xy.y = sinph0 * sinphi + cosph0 * cosphi * coslam;
        }
        if (fabs(fabs(xy.y) - 1) < TOL)
            if (xy.y < 0) f_error();
            else xy.x = xy.y = 0;
        else {
          xy.y = acos(xy.y);
          xy.y /= sin(xy.y);
          xy.x = xy.y * cosphi * sin(lp.lam);
          xy.y *= (mode == EQUIT) ? sinphi :
              cosph0 * sinphi - sinph0 * cosphi * coslam;
        }
        break;
      case N_POLE:
        lp.phi = -lp.phi;
        coslam = -coslam;
        /* falls through */
      case S_POLE:
        if (fabs(lp.phi - M_HALFPI) < EPS10) f_error();
        xy.x = (xy.y = (M_HALFPI + lp.phi)) * sin(lp.lam);
        xy.y *= coslam;
        break;
    }
  }

  function s_inv(xy, lp) {
    var x = xy.x, y = xy.y;
    var cosc, c_rh, sinc;
    if ((c_rh = hypot(x, y)) > M_PI) {
        if (c_rh - EPS10 > M_PI) i_error();
        c_rh = M_PI;
    } else if (c_rh < EPS10) {
      lp.phi = P.phi0;
      lp.lam = 0;
      return;
    }
    if (mode == OBLIQ || mode == EQUIT) {
      sinc = sin(c_rh);
      cosc = cos(c_rh);
      if (mode == EQUIT) {
        lp.phi = aasin(y * sinc / c_rh);
        x *= sinc;
        y = cosc * c_rh;
      } else {
        lp.phi = aasin(cosc * sinph0 + y * sinc * cosph0 / c_rh);
        y = (cosc - sinph0 * sin(lp.phi)) * c_rh;
        x *= sinc * cosph0;
      }
      lp.lam = y == 0 ? 0 : atan2(x, y);
    } else if (mode == N_POLE) {
      lp.phi = M_HALFPI - c_rh;
      lp.lam = atan2(x, -y);
    } else {
      lp.phi = c_rh - M_HALFPI;
      lp.lam = atan2(x, y);
    }
  }

  function e_guam_fwd(lp, xy) {
    var cosphi, sinphi, t;
    cosphi = cos(lp.phi);
    sinphi = sin(lp.phi);
    t = 1 / sqrt(1 - P.es * sinphi * sinphi);
    xy.x = lp.lam * cosphi * t;
    xy.y = pj_mlfn(lp.phi, sinphi, cosphi, en) - M1 +
        0.5 * lp.lam * lp.lam * cosphi * sinphi * t;
  }

  function e_guam_inv(xy, lp) {
    var x2, t, i;
    x2 = 0.5 * xy.x * xy.x;
    lp.phi = P.phi0;
    for (i = 0; i < 3; ++i) {
      t = P.e * sin(lp.phi);
      lp.phi = pj_inv_mlfn(M1 + xy.y -
        x2 * tan(lp.phi) * (t = sqrt(1 - t * t)), P.es, en);
    }
    lp.lam = xy.x * t / cos(lp.phi);
  }
}
