/* @require pj_tsfn */

pj_add(pj_stere, 'stere', 'Stereographic', '\n\tAzi, Sph&Ell\n\tlat_ts=');
pj_add(pj_ups, 'ups', 'Universal Polar Stereographic', '\n\tAzi, Sph&Ell\n\tsouth');

function pj_ups(P) {
  P.phi0 = pj_param(P.params, "bsouth") ? -M_HALFPI : M_HALFPI;
  P.k0 = 0.994;
  P.x0 = 2000000;
  P.y0 = 2000000;
  P.lam0 = 0;
  if (!P.es) e_error(-34);
  pj_stere_init(P, M_HALFPI);
}

function pj_stere(P) {
  var phits = pj_param (P.params, "tlat_ts") ? pj_param (P.params, "rlat_ts") : M_HALFPI;
  pj_stere_init(P, phits);
}

function pj_stere_init(P, phits) {
  var EPS10 = 1.e-10,
      TOL = 1.e-8,
      NITER = 8,
      CONV = 1.e-10,
      S_POLE = 0,
      N_POLE = 1,
      OBLIQ= 2,
      EQUIT = 3;
  var X, t, sinph0, cosph0;
  var sinX1, cosX1, akm1, mode;

  if (fabs((t = fabs (P.phi0)) - M_HALFPI) < EPS10)
      mode = P.phi0 < 0 ? S_POLE : N_POLE;
  else
      mode = t > EPS10 ? OBLIQ: EQUIT;
  phits = fabs (phits);

  if (P.es) {
    switch (mode) {
      case N_POLE:
      case S_POLE:
        if (fabs (phits - M_HALFPI) < EPS10)
            akm1 = 2 * P.k0 /
               sqrt(pow(1 + P.e, 1 + P.e) * pow(1 - P.e, 1 - P.e));
        else {
            akm1 = cos(phits) /
               pj_tsfn(phits, t = sin(phits), P.e);
            t *= P.e;
            akm1 /= sqrt(1 - t * t);
        }
        break;
      case EQUIT:
      case OBLIQ:
        t = sin(P.phi0);
        X = 2 * atan(ssfn(P.phi0, t, P.e)) - M_HALFPI;
        t *= P.e;
        akm1 = 2 * P.k0 * cos(P.phi0) / sqrt(1 - t * t);
        sinX1 = sin(X);
        cosX1 = cos(X);
        break;
    }
    P.fwd = e_fwd;
    P.inv = e_inv;
  } else {
    switch (mode) {
      case OBLIQ:
        sinph0 = sin(P.phi0);
        cosph0 = cos(P.phi0);
        /* falls through */
      case EQUIT:
        akm1 = 2 * P.k0;
        break;
      case S_POLE:
      case N_POLE:
        akm1 = fabs(phits - M_HALFPI) >= EPS10 ?
           cos(phits) / tan(M_FORTPI - 0.5 * phits) : 2 * P.k0;
        break;
    }
    P.fwd = s_fwd;
    P.inv = s_inv;
  }

  function e_fwd(lp, xy) {
    var coslam, sinlam, sinX = 0, cosX = 0, X, A, sinphi;
    coslam = cos(lp.lam);
    sinlam = sin(lp.lam);
    sinphi = sin(lp.phi);
    if (mode == OBLIQ|| mode == EQUIT) {
        sinX = sin(X = 2 * atan(ssfn(lp.phi, sinphi, P.e)) - M_HALFPI);
        cosX = cos(X);
    }

    switch (mode) {
      case OBLIQ:
        A = akm1 / (cosX1 * (1 + sinX1 * sinX +
           cosX1 * cosX * coslam));
        xy.y = A * (cosX1 * sinX - sinX1 * cosX * coslam);
        xy.x = A * cosX;
        break;
      case EQUIT:
        /* zero division is handled in pj_fwd */
        A = akm1 / (1 + cosX * coslam);
        xy.y = A * sinX;
        xy.x = A * cosX;
        break;
      case S_POLE:
        lp.phi = -lp.phi;
        coslam = -coslam;
        sinphi = -sinphi;
        /* falls through */
      case N_POLE:
        xy.x = akm1 * pj_tsfn (lp.phi, sinphi, P.e);
        xy.y = - xy.x * coslam;
        break;
    }
    xy.x = xy.x * sinlam;
  }

  function s_fwd(lp, xy) {
    var phi = lp.phi,
        sinphi = sin(phi),
        cosphi = cos(phi),
        coslam = cos(lp.lam),
        sinlam = sin(lp.lam);

    switch (mode) {
    case EQUIT:
    case OBLIQ:
      if (mode == EQUIT) {
        xy.y = 1 + cosphi * coslam;
      } else {
        xy.y = 1 + sinph0 * sinphi + cosph0 * cosphi * coslam;
      }
      if (xy.y <= EPS10) f_error();
      xy.x = (xy.y = akm1 / xy.y) * cosphi * sinlam;
      xy.y *= (mode == EQUIT) ? sinphi :
         cosph0 * sinphi - sinph0 * cosphi * coslam;
      break;
    case N_POLE:
      coslam = - coslam;
      phi = - phi;
      /* falls through */
    case S_POLE:
      if (fabs(phi - M_HALFPI) < TOL) f_error();
      xy.x = sinlam * (xy.y = akm1 * tan (M_FORTPI + 0.5 * phi));
      xy.y *= coslam;
      break;
    }
  }

  function e_inv(xy, lp) {
    var phi = lp.phi,
        tp=0, phi_l=0, halfe=0, halfpi=0,
        cosphi, sinphi, rho, i;
    rho = hypot (xy.x, xy.y);

    switch (mode) {
      case OBLIQ:
      case EQUIT:
        cosphi = cos ( tp = 2 * atan2(rho * cosX1 , akm1));
        sinphi = sin (tp);
                if ( rho == 0 )
            phi_l = asin (cosphi * sinX1);
                else
            phi_l = asin (cosphi * sinX1 + (xy.y * sinphi * cosX1 / rho));

        tp = tan (0.5 * (M_HALFPI + phi_l));
        xy.x *= sinphi;
        xy.y = rho * cosX1 * cosphi - xy.y * sinX1* sinphi;
        halfpi = M_HALFPI;
        halfe = 0.5 * P.e;
        break;
      case N_POLE:
        xy.y = -xy.y;
        /* falls through */
      case S_POLE:
        phi_l = M_HALFPI - 2 * atan (tp = - rho / akm1);
        halfpi = -M_HALFPI;
        halfe = -0.5 * P.e;
        break;
    }

    for (i = 0; i < NITER; i++, phi_l = lp.phi) {
      sinphi = P.e * sin(phi_l);
      lp.phi = 2 * atan (tp * pow ((1+sinphi)/(1-sinphi), halfe)) - halfpi;
      if (fabs(phi_l - lp.phi) < CONV) {
        if (mode == S_POLE)
          lp.phi = -lp.phi;
        lp.lam = (xy.x == 0 && xy.y == 0) ? 0 : atan2 (xy.x, xy.y);
        return;
      }
    }
    i_error();
  }

  function s_inv(xy, lp) {
    var c, rh, sinc, cosc;
    sinc = sin(c = 2 * atan ((rh = hypot(xy.x, xy.y)) / akm1));
    cosc = cos(c);
    lp.lam = 0;

    switch (mode) {
      case EQUIT:
        if (fabs (rh) <= EPS10)
            lp.phi = 0;
        else
            lp.phi = asin (xy.y * sinc / rh);
        if (cosc != 0 || xy.x != 0)
            lp.lam = atan2 (xy.x * sinc, cosc * rh);
        break;
      case OBLIQ:
        if (fabs (rh) <= EPS10)
            lp.phi = P.phi0;
        else
            lp.phi = asin (cosc * sinph0 + xy.y * sinc * cosph0 / rh);
        if ((c = cosc - sinph0 * sin (lp.phi)) != 0 || xy.x != 0)
            lp.lam = atan2 (xy.x * sinc * cosph0, c * rh);
        break;
      case N_POLE:
        xy.y = -xy.y;
        /* falls through */
      case S_POLE:
        if (fabs (rh) <= EPS10)
            lp.phi = P.phi0;
        else
            lp.phi = asin (mode == S_POLE ? - cosc : cosc);
        lp.lam = (xy.x == 0 && xy.y == 0) ? 0 : atan2 (xy.x, xy.y);
        break;
    }
  }

  function ssfn(phit, sinphi, eccen) {
    sinphi *= eccen;
    return tan(0.5 * (M_HALFPI + phit)) *
       pow ((1 - sinphi) / (1 + sinphi), 0.5 * eccen);
  }
}
