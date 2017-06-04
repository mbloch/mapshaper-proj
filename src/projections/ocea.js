pj_add(pj_ocea, 'ocea', 'Oblique Cylindrical Equal Area', '\n\tCyl, Sph lonc= alpha= or\n\tlat_1= lat_2= lon_1= lon_2=');

function pj_ocea(P) {
  var phi_0 = 0,
      phi_1, phi_2, lam_1, lam_2, lonz, alpha,
      rok, rtk, sinphi, cosphi, singam, cosgam;
  rok = 1 / P.k0;
  rtk = P.k0;
  /*If the keyword "alpha" is found in the sentence then use 1point+1azimuth*/
  if (pj_param(P.params, "talpha")) {
    /*Define Pole of oblique transformation from 1 point & 1 azimuth*/
    alpha   = pj_param(P.params, "ralpha");
    lonz = pj_param(P.params, "rlonc");
    /*Equation 9-8 page 80 (http://pubs.usgs.gov/pp/1395/report.pdf)*/
    singam = atan(-cos(alpha)/(-sin(phi_0) * sin(alpha))) + lonz;
    /*Equation 9-7 page 80 (http://pubs.usgs.gov/pp/1395/report.pdf)*/
    sinphi = asin(cos(phi_0) * sin(alpha));
  /*If the keyword "alpha" is NOT found in the sentence then use 2points*/
  } else {
    /*Define Pole of oblique transformation from 2 points*/
    phi_1 = pj_param(P.params, "rlat_1");
    phi_2 = pj_param(P.params, "rlat_2");
    lam_1 = pj_param(P.params, "rlon_1");
    lam_2 = pj_param(P.params, "rlon_2");
    /*Equation 9-1 page 80 (http://pubs.usgs.gov/pp/1395/report.pdf)*/
    singam = atan2(cos(phi_1) * sin(phi_2) * cos(lam_1) -
      sin(phi_1) * cos(phi_2) * cos(lam_2),
      sin(phi_1) * cos(phi_2) * sin(lam_2) -
      cos(phi_1) * sin(phi_2) * sin(lam_1) );

    /* take care of P->lam0 wrap-around when +lam_1=-90*/
    if (lam_1 == -M_HALFPI)
      singam = -singam;

    /*Equation 9-2 page 80 (http://pubs.usgs.gov/pp/1395/report.pdf)*/
    sinphi = atan(-cos(singam - lam_1) / tan(phi_1));
  }
  P.lam0 = singam + M_HALFPI;
  cosphi = cos(sinphi);
  sinphi = sin(sinphi);
  cosgam = cos(singam);
  singam = sin(singam);
  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    var t;
    xy.y = sin(lp.lam);
    t = cos(lp.lam);
    xy.x = atan((tan(lp.phi) * cosphi + sinphi * xy.y) / t);
    if (t < 0)
        xy.x += M_PI;
    xy.x *= rtk;
    xy.y = rok * (sinphi * sin(lp.phi) - cosphi * cos(lp.phi) * xy.y);
  }

  function s_inv(xy, lp) {
    var t, s;
    xy.y /= rok;
    xy.x /= rtk;
    t = sqrt(1 - xy.y * xy.y);
    lp.phi = asin(xy.y * sinphi + t * cosphi * (s = sin(xy.x)));
    lp.lam = atan2(t * sinphi * s - xy.y * cosphi,
        t * cos(xy.x));
  }
}
