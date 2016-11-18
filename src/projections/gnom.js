
pj_add(pj_gnom, 'gnom', 'Gnomonic', '\n\tAzi, Sph.');

function pj_gnom(P) {
  var EPS10 = 1.e-10,
      N_POLE = 0,
      S_POLE = 1,
      EQUIT = 2,
      OBLIQ = 3;
  var sinphi0, cosph0, mode;
  if (fabs(fabs(P.phi0) - M_HALFPI) < EPS10) {
      mode = P.phi0 < 0 ? S_POLE : N_POLE;
  } else if (fabs(P.phi0) < EPS10) {
      mode = EQUIT;
  } else {
      mode = OBLIQ;
      sinph0 = sin(P.phi0);
      cosph0 = cos(P.phi0);
  }

  P.inv = s_inv;
  P.fwd = s_fwd;
  P.es = 0;

  function s_fwd(lp, xy) {
    var coslam, cosphi, sinphi;
    sinphi = sin(lp.phi);
    cosphi = cos(lp.phi);
    coslam = cos(lp.lam);

    switch (mode) {
        case EQUIT:
            xy.y = cosphi * coslam;
            break;
        case OBLIQ:
            xy.y = sinph0 * sinphi + cosph0 * cosphi * coslam;
            break;
        case S_POLE:
            xy.y = - sinphi;
            break;
        case N_POLE:
            xy.y = sinphi;
            break;
    }

    if (xy.y <= EPS10) f_error();

    xy.x = (xy.y = 1 / xy.y) * cosphi * sin(lp.lam);
    switch (mode) {
        case EQUIT:
            xy.y *= sinphi;
            break;
        case OBLIQ:
            xy.y *= cosph0 * sinphi - sinph0 * cosphi * coslam;
            break;
        case N_POLE:
            coslam = - coslam;
            /* falls through */
        case S_POLE:
            xy.y *= cosphi * coslam;
            break;
    }
  }

  function s_inv(xy, lp) {
    var x = xy.x, y = xy.y; // modified below
    var rh, cosz, sinz;
    rh = hypot(x, y);
    sinz = sin(lp.phi = atan(rh));
    cosz = sqrt(1 - sinz * sinz);

    if (fabs(rh) <= EPS10) {
        lp.phi = P.phi0;
        lp.lam = 0;
    } else {
        switch (mode) {
            case OBLIQ:
                lp.phi = cosz * sinph0 + y * sinz * cosph0 / rh;
                if (fabs(lp.phi) >= 1)
                    lp.phi = lp.phi > 0 ? M_HALFPI : -M_HALFPI;
                else
                    lp.phi = asin(lp.phi);
                y = (cosz - sinph0 * sin(lp.phi)) * rh;
                x *= sinz * cosph0;
                break;
            case EQUIT:
                lp.phi = y * sinz / rh;
                if (fabs(lp.phi) >= 1)
                    lp.phi = lp.phi > 0 ? M_HALFPI : -M_HALFPI;
                else
                    lp.phi = asin(lp.phi);
                y = cosz * rh;
                x *= sinz;
                break;
            case S_POLE:
                lp.phi -= M_HALFPI;
                break;
            case N_POLE:
                lp.phi = M_HALFPI - lp.phi;
                y = -y;
                break;
        }
        lp.lam = atan2(x, y);
    }
  }
}
