pj_add(pj_airy, 'airy', 'Airy', '\n\tMisc Sph, no inv.\n\tno_cut lat_b=');

function pj_airy(P) {
  var EPS = 1e-10,
      N_POLE = 0,
      S_POLE = 1,
      EQUIT = 2,
      OBLIQ = 3,
      p_halfphi, sinph0, cosph0, Cb, mode, no_cut, beta;

  P.es = 0;
  P.fwd = s_fwd;

  no_cut = pj_param(P.params, "bno_cut");
  beta = 0.5 * (M_HALFPI - pj_param(P.params, "rlat_b"));
  if (fabs(beta) < EPS)
    Cb = -0.5;
  else {
    Cb = 1/tan(beta);
    Cb *= Cb * log(cos(beta));
  }

  if (fabs(fabs(P.phi0) - M_HALFPI) < EPS)
    if (P.phi0 < 0) {
      p_halfpi = -M_HALFPI;
      mode = S_POLE;
    } else {
      p_halfpi =  M_HALFPI;
      mode = N_POLE;
    }
  else {
    if (fabs(P.phi0) < EPS)
      mode = EQUIT;
    else {
      mode = OBLIQ;
      sinph0 = sin(P.phi0);
      cosph0 = cos(P.phi0);
    }
  }

  function s_fwd(lp, xy) {
    var sinlam, coslam, cosphi, sinphi, t, s, Krho, cosz;
    sinlam = sin(lp.lam);
    coslam = cos(lp.lam);
    switch (mode) {
      case EQUIT:
      case OBLIQ:
        sinphi = sin(lp.phi);
        cosphi = cos(lp.phi);
        cosz = cosphi * coslam;
        if (mode == OBLIQ)
          cosz = sinph0 * sinphi + cosph0 * cosz;
        if (!no_cut && cosz < -EPS)
          f_error();
        if (fabs(s = 1 - cosz) > EPS) {
          t = 0.5 * (1 + cosz);
          Krho = -log(t)/s - Cb / t;
        } else {
          Krho = 0.5 - Cb;
        }
        xy.x = Krho * cosphi * sinlam;
        if (mode == OBLIQ)
          xy.y = Krho * (cosph0 * sinphi - sinph0 * cosphi * coslam);
        else
          xy.y = Krho * sinphi;
        break;
      case S_POLE:
      case N_POLE:
        lp.phi = fabs(p_halfpi - lp.phi);
        if (!no_cut && (lp.phi - EPS) > M_HALFPI)
          f_error();
        if ((lp.phi *= 0.5) > EPS) {
          t = tan(lp.phi);
          Krho = -2*(log(cos(lp.phi)) / t + t * Cb);
          xy.x = Krho * sinlam;
          xy.y = Krho * coslam;
          if (mode == N_POLE)
            xy.y = -xy.y;
        } else
          xy.x = xy.y = 0;
    }
  }
}
