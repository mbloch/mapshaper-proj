
pj_add(pj_gnom, 'gnom', 'Gnomonic', 'Azi, Sph.');

function pj_gnom(P) {
  var EPS10 = 1.e-10,
      N_POLE = 0,
      S_POLE = 1,
      EQUIT = 2,
      OBLIQ = 3;
  var sinph0, cosph0, mode;
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
    // cos() rather than sqrt(1 - sinz * sinz), which loses the digits close to
    // 90 degrees from the centre and defeats the atan2() below
    cosz = cos(lp.phi);

    if (rh === 0) {
        lp.phi = P.phi0;
        lp.lam = 0;
    } else {
        switch (mode) {
            case OBLIQ:
            case EQUIT:
                // rh * sin(phi), rh * cos(phi) * cos(lam) and rh * cos(phi) * sin(lam):
                // atan2() keeps the latitude accurate near the poles, where asin() did not
                var s0 = mode == EQUIT ? 0 : sinph0;
                var c0 = mode == EQUIT ? 1 : cosph0;
                var n = rh * cosz * s0 + y * sinz * c0;
                y = rh * cosz * c0 - y * sinz * s0;
                x *= sinz;
                lp.phi = atan2(n, hypot(x, y));
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
