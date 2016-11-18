/* @requires pj_auth pj_qsfn */

pj_add(pj_laea, 'laea', 'Lambert Azimuthal Equal Area', '\n\tAzi, Sph&Ell');

function pj_laea(P) {
  var EPS10 = 1e-10,
      NITER = 20,
      CONV = 1e-10,
      N_POLE = 0,
      S_POLE = 1,
      EQUIT = 2,
      OBLIQ = 3;
  var sinb1, cosb1, xmf, ymf, mmf, qp, dd, rq, apa, mode, t, sinphi;

  t = fabs(P.phi0);
  if (fabs(t - M_HALFPI) < EPS10)
      mode = P.phi0 < 0 ? S_POLE : N_POLE;
  else if (fabs(t) < EPS10)
      mode = EQUIT;
  else
      mode = OBLIQ;
  if (P.es) {
      P.e = sqrt(P.es);
      qp = pj_qsfn(1, P.e, P.one_es);
      mmf = 0.5 / (1 - P.es);
      apa = pj_authset(P.es);
      switch (mode) {
        case N_POLE:
        case S_POLE:
          dd = 1;
          break;
        case EQUIT:
          dd = 1 / (rq = sqrt(0.5 * qp));
          xmf = 1;
          ymf = 0.5 * qp;
          break;
        case OBLIQ:
          rq = sqrt(0.5 * qp);
          sinphi = sin(P.phi0);
          sinb1 = pj_qsfn(sinphi, P.e, P.one_es) / qp;
          cosb1 = sqrt(1 - sinb1 * sinb1);
          dd = cos(P.phi0) / (sqrt(1 - P.es * sinphi * sinphi) *
             rq * cosb1);
          ymf = (xmf = rq) / dd;
          xmf *= dd;
          break;
      }
      P.inv = e_inv;
      P.fwd = e_fwd;
  } else {
      if (mode == OBLIQ) {
          sinb1 = sin(P.phi0);
          cosb1 = cos(P.phi0);
      }
      P.inv = s_inv;
      P.fwd = s_fwd;
  }

  function e_fwd(lp, xy) {
    var coslam, sinlam, sinphi, q, sinb=0.0, cosb=0.0, b=0.0;
    coslam = cos(lp.lam);
    sinlam = sin(lp.lam);
    sinphi = sin(lp.phi);
    q = pj_qsfn(sinphi, P.e, P.one_es);

    if (mode == OBLIQ || mode == EQUIT) {
        sinb = q / qp;
        cosb = sqrt(1 - sinb * sinb);
    }

    switch (mode) {
      case OBLIQ:
        b = 1 + sinb1 * sinb + cosb1 * cosb * coslam;
        break;
      case EQUIT:
        b = 1 + cosb * coslam;
        break;
      case N_POLE:
        b = M_HALFPI + lp.phi;
        q = qp - q;
        break;
      case S_POLE:
        b = lp.phi - M_HALFPI;
        q = qp + q;
        break;
    }
    if (fabs(b) < EPS10) f_error();

    switch (mode) {
      case OBLIQ:
      case EQUIT:
        if (mode == OBLIQ) {
          b = sqrt(2 / b);
          xy.y = ymf * b * (cosb1 * sinb - sinb1 * cosb * coslam);
        } else {
          b = sqrt(2 / (1 + cosb * coslam));
          xy.y = b * sinb * ymf;
        }
        xy.x = xmf * b * cosb * sinlam;
        break;
      case N_POLE:
      case S_POLE:
        if (q >= 0) {
            b = sqrt(q);
            xy.x = b * sinlam;
            xy.y = coslam * (mode == S_POLE ? b : -b);
        } else
            xy.x = xy.y = 0;
        break;
    }
  }

  function e_inv(xy, lp) {
    var cCe, sCe, q, rho, ab=0.0;

    switch (mode) {
      case EQUIT:
      case OBLIQ:
        xy.x /= dd;
        xy.y *=  dd;
        rho = hypot(xy.x, xy.y);
        if (rho < EPS10) {
            lp.lam = 0;
            lp.phi = P.phi0;
            return lp;
        }
        sCe = 2 * asin(0.5 * rho / rq);
        cCe = cos(sCe);
        sCe = sin(sCe);
        xy.x *= sCe;
        if (mode == OBLIQ) {
            ab = cCe * sinb1 + xy.y * sCe * cosb1 / rho;
            xy.y = rho * cosb1 * cCe - xy.y * sinb1 * sCe;
        } else {
            ab = xy.y * sCe / rho;
            xy.y = rho * cCe;
        }
        break;
      case N_POLE:
        xy.y = -xy.y;
        /* falls through */
      case S_POLE:
        q = (xy.x * xy.x + xy.y * xy.y);
        if (!q) {
            lp.lam = 0;
            lp.phi = P.phi0;
            return (lp);
        }
        ab = 1 - q / qp;
        if (mode == S_POLE)
            ab = - ab;
        break;
    }
    lp.lam = atan2(xy.x, xy.y);
    lp.phi = pj_authlat(asin(ab), apa);
    return lp;
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
          xy.y = 1 + cosphi * coslam;
        } else {
          xy.y = 1 + sinb1 * sinphi + cosb1 * cosphi * coslam;
        }
        if (xy.y <= EPS10) f_error();
        xy.y = sqrt(2 / xy.y);
        xy.x = xy.y * cosphi * sin(lp.lam);
        xy.y *= mode == EQUIT ? sinphi :
           cosb1 * sinphi - sinb1 * cosphi * coslam;
        break;
      case N_POLE:
        coslam = -coslam;
        /* falls through */
      case S_POLE:
        if (fabs(lp.phi + P.phi0) < EPS10) f_error();
        xy.y = M_FORTPI - lp.phi * 0.5;
        xy.y = 2 * (mode == S_POLE ? cos(xy.y) : sin(xy.y));
        xy.x = xy.y * sin(lp.lam);
        xy.y *= coslam;
        break;
    }
  }

  function s_inv(xy, lp) {
    var cosz=0.0, rh, sinz=0.0;

    rh = hypot(xy.x, xy.y);
    if ((lp.phi = rh * 0.5 ) > 1) i_error();
    lp.phi = 2 * asin(lp.phi);
    if (mode == OBLIQ || mode == EQUIT) {
        sinz = sin(lp.phi);
        cosz = cos(lp.phi);
    }
    switch (mode) {
      case EQUIT:
        lp.phi = fabs(rh) <= EPS10 ? 0 : asin(xy.y * sinz / rh);
        xy.x *= sinz;
        xy.y = cosz * rh;
        break;
      case OBLIQ:
        lp.phi = fabs(rh) <= EPS10 ? P.phi0 :
           asin(cosz * sinb1 + xy.y * sinz * cosb1 / rh);
        xy.x *= sinz * cosb1;
        xy.y = (cosz - sin(lp.phi) * sinb1) * rh;
        break;
      case N_POLE:
        xy.y = -xy.y;
        lp.phi = M_HALFPI - lp.phi;
        break;
      case S_POLE:
        lp.phi -= M_HALFPI;
        break;
    }
    lp.lam = (xy.y == 0 && (mode == EQUIT || mode == OBLIQ)) ?
        0 : atan2(xy.x, xy.y);
  }
}
