pj_add(pj_ortho, 'ortho', 'Orthographic', '\n\tAzi, Sph.');

function pj_ortho(P) {
  var EPS10 = 1.e-10,
      N_POLE = 0,
      S_POLE = 1,
      EQUIT = 2,
      OBLIQ = 3;
  var Q = {};

  if (fabs(fabs(P.phi0) - M_HALFPI) <= EPS10)
    Q.mode = P.phi0 < 0 ? S_POLE : N_POLE;
  else if (fabs(P.phi0) > EPS10) {
    Q.mode = OBLIQ;
    Q.sinph0 = sin(P.phi0);
    Q.cosph0 = cos(P.phi0);
  } else
    Q.mode = EQUIT;

  P.fwd = s_fwd;
  P.inv = s_inv;
  P.es = 0;

  function s_fwd(lp, xy) {
    var coslam, cosphi, sinphi;
    cosphi = cos(lp.phi);
    coslam = cos(lp.lam);
    switch (Q.mode) {
    case EQUIT:
      if (cosphi * coslam < - EPS10) f_error();
      xy.y = sin(lp.phi);
      break;
    case OBLIQ:
      if (Q.sinph0 * (sinphi = sin(lp.phi)) +
         Q.cosph0 * cosphi * coslam < - EPS10) f_error();
      xy.y = Q.cosph0 * sinphi - Q.sinph0 * cosphi * coslam;
      break;
    case N_POLE:
      coslam = -coslam;
      /* falls through */
    case S_POLE:
      if (fabs(lp.phi - P.phi0) - EPS10 > M_HALFPI) f_error();
      xy.y = cosphi * coslam;
      break;
    }
    xy.x = cosphi * sin(lp.lam);
  }

  function s_inv(xy, lp) {
    var rh, cosc, sinc;

    if ((sinc = (rh = hypot(xy.x, xy.y))) > 1) {
        if ((sinc - 1) > EPS10) i_error();
        sinc = 1;
    }
    cosc = sqrt(1 - sinc * sinc); /* in this range OK */
    if (fabs(rh) <= EPS10) {
        lp.phi = P.phi0;
        lp.lam = 0.0;
    } else {
        switch (Q.mode) {
        case N_POLE:
            xy.y = -xy.y;
            lp.phi = acos(sinc);
            break;
        case S_POLE:
            lp.phi = - acos(sinc);
            break;
        case EQUIT:
        case OBLIQ:
          if (Q.mode == EQUIT) {
            lp.phi = xy.y * sinc / rh;
            xy.x *= sinc;
            xy.y = cosc * rh;
          } else {
            lp.phi = cosc * Q.sinph0 + xy.y * sinc * Q.cosph0 /rh;
            xy.y = (cosc - Q.sinph0 * lp.phi) * rh;
            xy.x *= sinc * Q.cosph0;
          }
          if (fabs(lp.phi) >= 1)
              lp.phi = lp.phi < 0 ? -M_HALFPI : M_HALFPI;
          else
              lp.phi = asin(lp.phi);
          break;
        }
        lp.lam = (xy.y == 0 && (Q.mode == OBLIQ || Q.mode == EQUIT)) ?
          (xy.x == 0 ? 0 : xy.x < 0 ? -M_HALFPI : M_HALFPI) : atan2(xy.x, xy.y);
    }
  }
}
