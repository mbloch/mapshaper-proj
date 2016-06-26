
// TODO: remove error codes (Proj.4 doesn't do anything with them)
var GEOCENT_NO_ERROR = 0x0000,
    GEOCENT_LAT_ERROR = 0x0001,
    GEOCENT_LON_ERROR = 0x0002,
    GEOCENT_A_ERROR = 0x0004,
    GEOCENT_B_ERROR = 0x0008,
    GEOCENT_A_LESS_B_ERROR = 0x0010;

// a: Semi-major axis, in meters.
// b: Semi-minor axis, in meters.
function pj_Set_Geocentric_Parameters(a, b) {
  var err = GEOCENT_NO_ERROR,
      a2 = a * a,
      b2 = b * b;
  if (a <= 0.0) err |= GEOCENT_A_ERROR;
  if (b <= 0.0) err |= GEOCENT_B_ERROR;
  if (a < b) err |= GEOCENT_A_LESS_B_ERROR;
  return err ? null : {
    a: a,
    b: b,
    a2: a2,
    b2: b2,
    e2: (a2 - b2) / a2,
    ep2: (a2 - b2) / b2
  };
}


function pj_Convert_Geodetic_To_Geocentric(gi, i, xx, yy, zz) {
  var err = GEOCENT_NO_ERROR,
      lng = xx[i],
      lat = yy[i],
      height = zz[i],
      x, y, z,
      rn, sinlat, sin2lat, coslat;
  if (lat < -M_HALFPI && lat > -1.001 * M_HALFPI) {
    lat = -M_HALFPI;
  } else if (lat > M_HALFPI && lat < 1.001 * M_HALFPI) {
    lat = M_HALFPI;
  } else if (lat < -M_HALFPI || lat > M_HALFPI) {
    err |= GEOCENT_LAT_ERROR;
  }

  if (!err) {
    if (lng > M_PI) lng -= 2 * M_PI;
    sinlat = sin(lat);
    coslat = cos(lat);
    sin2lat = sinlat * sinlat;
    rn = gi.a / sqrt(1 - gi.e2 * sin2lat);
    xx[i] = (rn + height) * coslat * cos(lng);
    yy[i] = (rn + height) * coslat * sin(lng);
    zz[i] = ((rn * (1 - gi.e2)) + height) * sinlat;
  }
  return err;
}


function pj_Convert_Geocentric_To_Geodetic(gi, i, xx, yy, zz) {
  var EPS = 1e-12,
      EPS2 = EPS * EPS,
      MAXITER = 30,
      x = xx[i],
      y = yy[i],
      z = zz[i],
      lat, lng, height,
      p, rr, ct, st, rx, rn, rk, cphi0, sphi0, cphi, sphi, sdphi, iter;

  p = sqrt(x * x + y * y);
  rr = sqrt(x * x + y * y + z * z);

  if (p / gi.a < EPS) {
    lng = 0;
    if (rr / gi.a < EPS) {
      xx[i] = 0;
      yy[i] = M_HALFPI;
      zz[i] = -gi.b;
      return 0;
    }
  } else {
    lng = atan2(y, x);
  }

  ct = z / rr;
  st = p / rr;
  rx = 1 / sqrt(1 - gi.e2 * (2 - gi.e2) * st * st);
  cphi0 = st * (1 - gi.e2) * rx;
  sphi0 = ct * rx;
  iter = 0;

  do {
    iter++;
    rn = gi.a / sqrt(1 - gi.e2 * sphi0 * sphi0);
    height = p * cphi0 + z * sphi0 - rn * (1 - gi.e2 * sphi0 * sphi0);
    rk = gi.e2 * rn / (rn + height);
    rx = 1 / sqrt(1 - rk * (2 - rk) * st * st);
    cphi = st * (1 - rk) * rx;
    sphi = ct * rx;
    sdphi = sphi * cphi0 - cphi * sphi0;
    cphi0 = cphi;
    sphi0 = sphi;
  } while (sdphi * sdphi > EPS2 && iter < MAXITER);
  lat = atan(sphi / fabs(cphi));
  xx[i] = lng;
  yy[i] = lat;
  zz[i] = height;
}

