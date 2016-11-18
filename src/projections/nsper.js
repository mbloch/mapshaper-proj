pj_add(pj_nsper, 'nsper', 'Near-sided perspective', '\n\tAzi, Sph\n\th=');
pj_add(pj_tpers, 'tpers', 'Tilted perspective', '\n\tAzi, Sph\n\ttilt= azi= h=');

function pj_nsper(P) {
  pj_tpers_init(P, pj_param(P.params, "dh"));
}

function pj_tpers(P) {
  var tilt = pj_param(P.params, 'dtilt') * DEG_TO_RAD;
  var azi = pj_param(P.params, 'dazi') * DEG_TO_RAD;
  var height = pj_param(P.params, "dh");
  pj_tpers_init(P, height, tilt, azi);
}

function pj_tpers_init(P, height, tiltAngle, azimuth) {
  var N_POLE = 0,
      S_POLE = 1,
      EIT = 2,
      OBLI= 3,
      tilt = !isNaN(tiltAngle) && !isNaN(azimuth),
      mode, sinph0, cosph0, p, rp, pn1, pfact, h, cg, sg, sw, cw;

  if (height <= 0) e_error(-30);
  if (tilt) {
    cg = cos(azimuth);
    sg = sin(azimuth);
    cw = cos(tiltAngle);
    sw = sin(tiltAngle);
  }
  if (fabs(fabs(P.phi0) - M_HALFPI) < EPS10)
    mode = P.phi0 < 0 ? S_POLE : N_POLE;
  else if (fabs(P.phi0) < EPS10)
    mode = EIT;
  else {
    mode = OBLI;
    sinph0 = sin(P.phi0);
    cosph0 = cos(P.phi0);
  }
  pn1 = height / P.a; /* normalize by radius */
  p = 1 + pn1;
  rp = 1 / p;
  h = 1 / pn1;
  pfact = (p + 1) * h;

  P.fwd = s_fwd;
  P.inv = s_inv;
  P.es = 0;

  function s_fwd(lp, xy) {
    var coslam, cosphi, sinphi;
    var yt, ba;
    sinphi = sin(lp.phi);
    cosphi = cos(lp.phi);
    coslam = cos(lp.lam);
    switch (mode) {
      case OBLI:
        xy.y = sinph0 * sinphi + cosph0 * cosphi * coslam;
        break;
      case EIT:
        xy.y = cosphi * coslam;
        break;
      case S_POLE:
        xy.y = - sinphi;
        break;
      case N_POLE:
        xy.y = sinphi;
        break;
    }
    if (xy.y < rp) f_error();
    xy.y = pn1 / (p - xy.y);
    xy.x = xy.y * cosphi * sin(lp.lam);
    switch (mode) {
      case OBLI:
        xy.y *= (cosph0 * sinphi -
           sinph0 * cosphi * coslam);
        break;
      case EIT:
        xy.y *= sinphi;
        break;
      case N_POLE:
        coslam = - coslam;
        /* falls through */
      case S_POLE:
        xy.y *= cosphi * coslam;
        break;
    }
    if (tilt) {
      yt = xy.y * cg + xy.x * sg;
      ba = 1 / (yt * sw * h + cw);
      xy.x = (xy.x * cg - xy.y * sg) * cw * ba;
      xy.y = yt * ba;
    }
  }

  function s_inv(xy, lp) {
    var rh, cosz, sinz;
    var bm, bq, yt;
    if (tilt) {
      yt = 1/(pn1 - xy.y * sw);
      bm = pn1 * xy.x * yt;
      bq = pn1 * xy.y * cw * yt;
      xy.x = bm * cg + bq * sg;
      xy.y = bq * cg - bm * sg;
    }
    rh = hypot(xy.x, xy.y);
    if ((sinz = 1 - rh * rh * pfact) < 0) i_error();
    sinz = (p - sqrt(sinz)) / (pn1 / rh + rh / pn1);
    cosz = sqrt(1 - sinz * sinz);
    if (fabs(rh) <= EPS10) {
        lp.lam = 0;
        lp.phi = P.phi0;
    } else {
      switch (mode) {
        case OBLI:
          lp.phi = asin(cosz * sinph0 + xy.y * sinz * cosph0 / rh);
          xy.y = (cosz - sinph0 * sin(lp.phi)) * rh;
          xy.x *= sinz * cosph0;
          break;
        case EIT:
          lp.phi = asin(xy.y * sinz / rh);
          xy.y = cosz * rh;
          xy.x *= sinz;
          break;
        case N_POLE:
          lp.phi = asin(cosz);
          xy.y = -xy.y;
          break;
        case S_POLE:
          lp.phi = - asin(cosz);
          break;
      }
      lp.lam = atan2(xy.x, xy.y);
    }
  }
}
