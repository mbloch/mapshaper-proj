pj_add(pj_qsc, 'qsc', 'Quadrilateralized Spherical Cube', '\n\tAzi, Sph.');

function pj_qsc(P) {
  var EPS10 = 1.e-10;

  /* The six cube faces. */
  var FACE_FRONT = 0;
  var FACE_RIGHT = 1;
  var FACE_BACK = 2;
  var FACE_LEFT = 3;
  var FACE_TOP = 4;
  var FACE_BOTTOM = 5;

  /* The four areas on a cube face. AREA_0 is the area of definition,
   * the other three areas are counted counterclockwise. */
  var AREA_0 = 0;
  var AREA_1 = 1;
  var AREA_2 = 2;
  var AREA_3 = 3;
  var face;
  var a_squared;
  var b;
  var one_minus_f;
  var one_minus_f_squared;

  /* Determine the cube face from the center of projection. */
  if (P.phi0 >= M_HALFPI - M_FORTPI / 2.0) {
    face = FACE_TOP;
  } else if (P.phi0 <= -(M_HALFPI - M_FORTPI / 2.0)) {
    face = FACE_BOTTOM;
  } else if (fabs(P.lam0) <= M_FORTPI) {
    face = FACE_FRONT;
  } else if (fabs(P.lam0) <= M_HALFPI + M_FORTPI) {
    face = (P.lam0 > 0.0 ? FACE_RIGHT : FACE_LEFT);
  } else {
    face = FACE_BACK;
  }
  /* Fill in useful values for the ellipsoid <-> sphere shift
   * described in [LK12]. */
  if (P.es !== 0.0) {
    a_squared = P.a * P.a;
    b = P.a * sqrt(1.0 - P.es);
    one_minus_f = 1.0 - (P.a - b) / P.a;
    one_minus_f_squared = one_minus_f * one_minus_f;
  }

  P.fwd = e_fwd;
  P.inv = e_inv;

  function e_fwd(lp, xy) {
    var lat, lon;
    var theta, phi;
    var t, mu; /* nu; */
    var area;
    var q, r, s;
    var sinlat, coslat;
    var sinlon, coslon;
    var tmp;

    /* Convert the geodetic latitude to a geocentric latitude.
     * This corresponds to the shift from the ellipsoid to the sphere
     * described in [LK12]. */
    if (P.es !== 0.0) {
      lat = atan(one_minus_f_squared * tan(lp.phi));
    } else {
      lat = lp.phi;
    }

    /* Convert the input lat, lon into theta, phi as used by QSC.
     * This depends on the cube face and the area on it.
     * For the top and bottom face, we can compute theta and phi
     * directly from phi, lam. For the other faces, we must use
     * unit sphere cartesian coordinates as an intermediate step. */
    lon = lp.lam;
    if (face == FACE_TOP) {
      phi = M_HALFPI - lat;
      if (lon >= M_FORTPI && lon <= M_HALFPI + M_FORTPI) {
        area = AREA_0;
        theta = lon - M_HALFPI;
      } else if (lon > M_HALFPI + M_FORTPI || lon <= -(M_HALFPI + M_FORTPI)) {
        area = AREA_1;
        theta = (lon > 0.0 ? lon - M_PI : lon + M_PI);
      } else if (lon > -(M_HALFPI + M_FORTPI) && lon <= -M_FORTPI) {
        area = AREA_2;
        theta = lon + M_HALFPI;
      } else {
        area = AREA_3;
        theta = lon;
      }
    } else if (face == FACE_BOTTOM) {
      phi = M_HALFPI + lat;
      if (lon >= M_FORTPI && lon <= M_HALFPI + M_FORTPI) {
        area = AREA_0;
        theta = -lon + M_HALFPI;
      } else if (lon < M_FORTPI && lon >= -M_FORTPI) {
        area = AREA_1;
        theta = -lon;
      } else if (lon < -M_FORTPI && lon >= -(M_HALFPI + M_FORTPI)) {
        area = AREA_2;
        theta = -lon - M_HALFPI;
      } else {
        area = AREA_3;
        theta = (lon > 0.0 ? -lon + M_PI : -lon - M_PI);
      }
    } else {
      if (face == FACE_RIGHT) {
        lon = qsc_shift_lon_origin(lon, +M_HALFPI);
      } else if (face == FACE_BACK) {
        lon = qsc_shift_lon_origin(lon, +M_PI);
      } else if (face == FACE_LEFT) {
        lon = qsc_shift_lon_origin(lon, -M_HALFPI);
      }
      sinlat = sin(lat);
      coslat = cos(lat);
      sinlon = sin(lon);
      coslon = cos(lon);
      q = coslat * coslon;
      r = coslat * sinlon;
      s = sinlat;

      if (face == FACE_FRONT) {
        phi = acos(q);
        tmp = qsc_fwd_equat_face_theta(phi, s, r);
      } else if (face == FACE_RIGHT) {
        phi = acos(r);
        tmp = qsc_fwd_equat_face_theta(phi, s, -q);
      } else if (face == FACE_BACK) {
        phi = acos(-q);
        tmp = qsc_fwd_equat_face_theta(phi, s, -r);
      } else if (face == FACE_LEFT) {
        phi = acos(-r);
        tmp = qsc_fwd_equat_face_theta(phi, s, q);
      } else {
        /* Impossible */
        phi = 0.0;
        tmp = {
          area: AREA_0,
          theta: 0
        };
      }
      theta = tmp.theta;
      area = tmp.area;
    }

    /* Compute mu and nu for the area of definition.
     * For mu, see Eq. (3-21) in [OL76], but note the typos:
     * compare with Eq. (3-14). For nu, see Eq. (3-38). */
    mu = atan((12.0 / M_PI) * (theta + acos(sin(theta) * cos(M_FORTPI)) - M_HALFPI));
    t = sqrt((1.0 - cos(phi)) / (cos(mu) * cos(mu)) / (1.0 - cos(atan(1.0 / cos(theta)))));
    /* nu = atan(t);        We don't really need nu, just t, see below. */

    /* Apply the result to the real area. */
    if (area == AREA_1) {
      mu += M_HALFPI;
    } else if (area == AREA_2) {
      mu += M_PI;
    } else if (area == AREA_3) {
      mu += M_PI_HALFPI;
    }

    /* Now compute x, y from mu and nu */
    /* t = tan(nu); */
    xy.x = t * cos(mu);
    xy.y = t * sin(mu);
  }

  function e_inv(xy, lp) {
    var mu, nu, cosmu, tannu;
    var tantheta, theta, cosphi, phi;
    var t;
    var area;

    /* Convert the input x, y to the mu and nu angles as used by QSC.
     * This depends on the area of the cube face. */
    nu = atan(sqrt(xy.x * xy.x + xy.y * xy.y));
    mu = atan2(xy.y, xy.x);
    if (xy.x >= 0.0 && xy.x >= fabs(xy.y)) {
      area = AREA_0;
    } else if (xy.y >= 0.0 && xy.y >= fabs(xy.x)) {
      area = AREA_1;
      mu -= M_HALFPI;
    } else if (xy.x < 0.0 && -xy.x >= fabs(xy.y)) {
      area = AREA_2;
      mu = (mu < 0.0 ? mu + M_PI : mu - M_PI);
    } else {
      area = AREA_3;
      mu += M_HALFPI;
    }

    /* Compute phi and theta for the area of definition.
     * The inverse projection is not described in the original paper, but some
     * good hints can be found here (as of 2011-12-14):
     * http://fits.gsfc.nasa.gov/fitsbits/saf.93/saf.9302
     * (search for "Message-Id: <9302181759.AA25477 at fits.cv.nrao.edu>") */
    t = (M_PI / 12.0) * tan(mu);
    tantheta = sin(t) / (cos(t) - (1.0 / sqrt(2.0)));
    theta = atan(tantheta);
    cosmu = cos(mu);
    tannu = tan(nu);
    cosphi = 1.0 - cosmu * cosmu * tannu * tannu * (1.0 - cos(atan(1.0 / cos(theta))));
    if (cosphi < -1.0) {
      cosphi = -1.0;
    } else if (cosphi > +1.0) {
      cosphi = +1.0;
    }

    /* Apply the result to the real area on the cube face.
     * For the top and bottom face, we can compute phi and lam directly.
     * For the other faces, we must use unit sphere cartesian coordinates
     * as an intermediate step. */
    if (face == FACE_TOP) {
      phi = acos(cosphi);
      lp.phi = M_HALFPI - phi;
      if (area == AREA_0) {
        lp.lam = theta + M_HALFPI;
      } else if (area == AREA_1) {
        lp.lam = (theta < 0.0 ? theta + M_PI : theta - M_PI);
      } else if (area == AREA_2) {
        lp.lam = theta - M_HALFPI;
      } else /* area == AREA_3 */ {
        lp.lam = theta;
      }
    } else if (face == FACE_BOTTOM) {
      phi = acos(cosphi);
      lp.phi = phi - M_HALFPI;
      if (area == AREA_0) {
        lp.lam = -theta + M_HALFPI;
      } else if (area == AREA_1) {
        lp.lam = -theta;
      } else if (area == AREA_2) {
        lp.lam = -theta - M_HALFPI;
      } else /* area == AREA_3 */ {
        lp.lam = (theta < 0.0 ? -theta - M_PI : -theta + M_PI);
      }
    } else {
      /* Compute phi and lam via cartesian unit sphere coordinates. */
      var q, r, s;
      q = cosphi;
      t = q * q;
      if (t >= 1.0) {
        s = 0.0;
      } else {
        s = sqrt(1.0 - t) * sin(theta);
      }
      t += s * s;
      if (t >= 1.0) {
        r = 0.0;
      } else {
        r = sqrt(1.0 - t);
      }
      /* Rotate q,r,s into the correct area. */
      if (area == AREA_1) {
        t = r;
        r = -s;
        s = t;
      } else if (area == AREA_2) {
        r = -r;
        s = -s;
      } else if (area == AREA_3) {
        t = r;
        r = s;
        s = -t;
      }
      /* Rotate q,r,s into the correct cube face. */
      if (face == FACE_RIGHT) {
        t = q;
        q = -r;
        r = t;
      } else if (face == FACE_BACK) {
        q = -q;
        r = -r;
      } else if (face == FACE_LEFT) {
        t = q;
        q = r;
        r = -t;
      }
      /* Now compute phi and lam from the unit sphere coordinates. */
      lp.phi = acos(-s) - M_HALFPI;
      lp.lam = atan2(r, q);
      if (face == FACE_RIGHT) {
        lp.lam = qsc_shift_lon_origin(lp.lam, -M_HALFPI);
      } else if (face == FACE_BACK) {
        lp.lam = qsc_shift_lon_origin(lp.lam, -M_PI);
      } else if (face == FACE_LEFT) {
        lp.lam = qsc_shift_lon_origin(lp.lam, +M_HALFPI);
      }
    }

    /* Apply the shift from the sphere to the ellipsoid as described
     * in [LK12]. */
    if (P.es !== 0) {
      var invert_sign;
      var tanphi, xa;
      invert_sign = (lp.phi < 0.0 ? 1 : 0);
      tanphi = tan(lp.phi);
      xa = b / sqrt(tanphi * tanphi + one_minus_f_squared);
      lp.phi = atan(sqrt(P.a * P.a - xa * xa) / (one_minus_f * xa));
      if (invert_sign) {
        lp.phi = -lp.phi;
      }
    }
  }

  /* Helper function for forward projection: compute the theta angle
   * and determine the area number. */
  function qsc_fwd_equat_face_theta(phi, y, x) {
    var area, theta;
    if (phi < EPS10) {
      area = AREA_0;
      theta = 0.0;
    } else {
      theta = atan2(y, x);
      if (fabs(theta) <= M_FORTPI) {
        area = AREA_0;
      } else if (theta > M_FORTPI && theta <= M_HALFPI + M_FORTPI) {
        area = AREA_1;
        theta -= M_HALFPI;
      } else if (theta > M_HALFPI + M_FORTPI || theta <= -(M_HALFPI + M_FORTPI)) {
        area = AREA_2;
        theta = (theta >= 0.0 ? theta - M_PI : theta + M_PI);
      } else {
        area = AREA_3;
        theta += M_HALFPI;
      }
    }
    return {
      area: area,
      theta: theta
    };
  }

  /* Helper function: shift the longitude. */
  function qsc_shift_lon_origin(lon, offset) {
    var slon = lon + offset;
    if (slon < -M_PI) {
      slon += M_TWOPI;
    } else if (slon > +M_PI) {
      slon -= M_TWOPI;
    }
    return slon;
  }
}
