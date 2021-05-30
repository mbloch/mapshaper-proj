/* @require pj_mlfn, etmerc */

pj_add(pj_tmerc, 'tmerc', 'Transverse Mercator', 'Cyl, Sph&Ell');
pj_add(pj_utm, 'utm', 'Universal Transverse Mercator (UTM)', 'Cyl, Sph\nzone= south');

function pj_utm_zone(P) {

}

function pj_utm(P) {
  var zone;
  if (!P.es) e_error(-34);
  P.y0 = pj_param(P.params, "bsouth") ? 10000000 : 0;
  P.x0 = 500000;
  if (pj_param(P.params, "tzone")) {
    if ((zone = pj_param(P.params, "izone")) > 0 && zone <= 60)
      --zone;
    else
      e_error(-35);
  } else { /* nearest central meridian input */
    zone = floor((adjlon(P.lam0) + M_PI) * 30 / M_PI);
    if (zone < 0)
      zone = 0;
    else if (zone >= 60)
      zone = 59;
  }
  P.lam0 = (zone + 0.5) * M_PI / 30 - M_PI;
  P.k0 = 0.9996;
  P.phi0 = 0;
  pj_etmerc(P);
}

function pj_tmerc(P) {
  // TODO: support +algo option
  if (pj_param(P.params, "bapprox")) {
    pj_tmerc_approx(P);
  } else {
    pj_tmerc_auto(P);
  }
}

function pj_tmerc_auto(P) {
  if (P.es === 0) {
    return pj_tmerc_approx(P);
  }
  pj_etmerc(P);
  var etfwd = P.fwd;
  var etinv = P.inv;
  pj_tmerc_approx(P);
  var fwd = P.fwd;
  var inv = P.inv;

  P.fwd = function(lp, xy) {
    if (fabs(lp.lam) > 3 * DEG_TO_RAD) etfwd(lp, xy);
    else fwd(lp, xy);
  };

  P.inv = function(xy, lp) {
    // See https://github.com/OSGeo/PROJ/blob/master/src/projections/tmerc.cpp
    if (fabs(xy.x) > 0.053 - 0.022 * xy.y * xy.y) etinv(xy, lp);
    else inv(xy, lp);
  };
}

function pj_tmerc_approx(P) {
  var EPS10 = 1e-10,
      FC1 = 1,
      FC2 = 0.5,
      FC3 = 0.16666666666666666666,
      FC4 = 0.08333333333333333333,
      FC5 = 0.05,
      FC6 = 0.03333333333333333333,
      FC7 = 0.02380952380952380952,
      FC8 = 0.01785714285714285714;
  var esp, ml0, en;

  if (P.es) {
    if (!(en = pj_enfn(P.es))) // in pj_mlfn.js
        e_error_0();
    ml0 = pj_mlfn(P.phi0, sin(P.phi0), cos(P.phi0), en);
    esp = P.es / (1 - P.es);
    P.fwd = e_fwd;
    P.inv = e_inv;
  } else {
    esp = P.k0;
    ml0 = 0.5 * esp;
    P.fwd = s_fwd;
    P.inv = s_inv;
  }

  function e_fwd(lp, xy) {
    var sinphi, cosphi, t, al, als, n;
    if ( lp.lam < -M_HALFPI || lp.lam > M_HALFPI ) {
      pj_ctx_set_errno(-14);
      return;
    }

    sinphi = sin (lp.phi);
    cosphi = cos (lp.phi);
    t = fabs(cosphi) > EPS10 ? sinphi/cosphi : 0;
    t *= t;
    al = cosphi * lp.lam;
    als = al * al;
    al /= sqrt(1 - P.es * sinphi * sinphi);
    n = esp * cosphi * cosphi;
    xy.x = P.k0 * al * (FC1 +
        FC3 * als * (1 - t + n +
        FC5 * als * (5 + t * (t - 18) + n * (14 - 58 * t) +
        FC7 * als * (61 + t * ( t * (179 - t) - 479 ) )
        )));
    xy.y = P.k0 * (pj_mlfn(lp.phi, sinphi, cosphi, en) - ml0 +
        sinphi * al * lp.lam * FC2 * ( 1 +
        FC4 * als * (5 - t + n * (9 + 4 * n) +
        FC6 * als * (61 + t * (t - 58) + n * (270 - 330 * t) +
        FC8 * als * (1385 + t * ( t * (543 - t) - 3111) )
        ))));
  }

  function s_fwd(lp, xy) {
    var b, cosphi;
    /*
     * Fail if our longitude is more than 90 degrees from the
     * central meridian since the results are essentially garbage.
     * Is error -20 really an appropriate return value?
     *
     *  http://trac.osgeo.org/proj/ticket/5
     */
    if( lp.lam < -M_HALFPI || lp.lam > M_HALFPI ) {
        pj_ctx_set_errno(-14);
        return;
    }
    cosphi = cos(lp.phi);
    b = cosphi * sin (lp.lam);
    if (fabs(fabs(b) - 1) <= EPS10) f_error();

    xy.x = ml0 * log ((1 + b) / (1 - b));
    xy.y = cosphi * cos(lp.lam) / sqrt(1 - b * b);

    b = fabs ( xy.y );
    if (b >= 1) {
      if ((b - 1) > EPS10) {
        f_error();
      } else {
        xy.y = 0;
      }
    } else
      xy.y = acos(xy.y);

    if (lp.phi < 0)
      xy.y = -xy.y;
    xy.y = esp * (xy.y - P.phi0);
  }

  function e_inv(xy, lp) {
    var n, con, cosphi, d, ds, sinphi, t;
    lp.phi = pj_inv_mlfn(ml0 + xy.y / P.k0, P.es, en);
    if (fabs(lp.phi) >= M_HALFPI) {
      lp.phi = xy.y < 0 ? -M_HALFPI : M_HALFPI;
      lp.lam = 0;
    } else {
      sinphi = sin(lp.phi);
      cosphi = cos(lp.phi);
      t = fabs (cosphi) > 1e-10 ? sinphi/cosphi : 0;
      n = esp * cosphi * cosphi;
      d = xy.x * sqrt (con = 1 - P.es * sinphi * sinphi) / P.k0;
      con *= t;
      t *= t;
      ds = d * d;
      lp.phi -= (con * ds / (1-P.es)) * FC2 * (1 -
        ds * FC4 * (5 + t * (3 - 9 *  n) + n * (1 - 4 * n) -
        ds * FC6 * (61 + t * (90 - 252 * n + 45 * t) + 46 * n -
        ds * FC8 * (1385 + t * (3633 + t * (4095 + 1575 * t)))
        )));
      lp.lam = d * (FC1 - ds * FC3 * (1 + 2 * t + n -
        ds * FC5 * (5 + t * (28 + 24*t + 8*n) + 6 * n -
        ds * FC7 * (61 + t * (662 + t * (1320 + 720 * t)))
        ))) / cosphi;
    }
  }

  function s_inv(xy, lp) {
    var h = exp(xy.x / esp);
    var g = 0.5 * (h - 1 / h);
    h = cos (P.phi0 + xy.y / esp);
    lp.phi = asin(sqrt((1 - h * h) / (1 + g * g)));
    /* Make sure that phi is on the correct hemisphere when false northing is used */
    if (xy.y < 0 && -lp.phi + P.phi0 < 0) lp.phi = -lp.phi;
    lp.lam = (g || h) ? atan2(g, h) : 0;
  }
}
