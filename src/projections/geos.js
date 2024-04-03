pj_add(pj_geos, 'geos', 'Geostationary Satellite View', 'Azi, Sph&Ell');

function pj_geos(P) {
  var radius_p, radius_p2, radius_p_inv2, radius_g, radius_g_1, C, flip_axis;
  var h = pj_param(P.params, "dh");
  var sweep_axis = pj_param(P.params, "ssweep");
  if (!sweep_axis)
    flip_axis = 0;
  else {
    if (sweep_axis == 'x')
      flip_axis = 1;
    else if (sweep_axis == 'y')
      flip_axis = 0;
    else
     e_error(-49);
  }

  radius_g_1 = h / P.a;
  if (radius_g_1 <= 0 || radius_g_1 > 1e10) {
    e_error(-50);
  }
  radius_g = 1 + radius_g_1;
  C = radius_g * radius_g - 1;
  if (P.es != 0) {
    radius_p = sqrt(P.one_es);
    radius_p2 = P.one_es;
    radius_p_inv2 = P.rone_es;
    P.inv = e_inv;
    P.fwd = e_fwd;
  } else {
    radius_p = radius_p2 = radius_p_inv2 = 1;
    P.inv = s_inv;
    P.fwd = s_fwd;
  }

  function s_fwd(lp, xy) {
    var tmp = cos(lp.phi);
    var Vx = cos(lp.lam) * tmp;
    var Vy = sin(lp.lam) * tmp;
    var Vz = sin(lp.phi);
    /* Calculation based on view angles from satellite.*/
    tmp = radius_g - Vx;

    if (flip_axis) {
      xy.x = radius_g_1 * atan(Vy / hypot(Vz, tmp));
      xy.y = radius_g_1 * atan(Vz / tmp);
    } else {
      xy.x = radius_g_1 * atan(Vy / tmp);
      xy.y = radius_g_1 * atan(Vz / hypot(Vy, tmp));
    }
  }

  function s_inv(xy, lp) {
    var Vx, Vy, Vz, a, b, k;

    /* Setting three components of vector from satellite to position.*/
    Vx = -1;
    if (flip_axis) {
      Vz = tan(xy.y / radius_g_1);
      Vy = tan(xy.x / radius_g_1) * sqrt(1 + Vz * Vz);
    } else {
      Vy = tan(xy.x / radius_g_1);
      Vz = tan(xy.y / radius_g_1) * sqrt(1 + Vy * Vy);
    }

    /* Calculation of terms in cubic equation and determinant.*/
    a = Vy * Vy + Vz * Vz + Vx * Vx;
    b = 2 * radius_g * Vx;
    var det = (b * b) - 4 * a * C;
    if (det < 0) {
      e_error(-51);
    }

    /* Calculation of three components of vector from satellite to position.*/
    k = (-b - sqrt(det)) / (2 * a);
    Vx = radius_g + k * Vx;
    Vy *= k;
    Vz *= k;

    /* Calculation of longitude and latitude.*/
    lp.lam = atan2(Vy, Vx);
    lp.phi = atan(Vz * cos(lp.lam) / Vx);
  }

  function e_fwd(lp, xy) {
    var r, Vx, Vy, Vz, tmp;

    /* Calculation of geocentric latitude. */
    lp.phi = atan(radius_p2 * tan(lp.phi));

    /* Calculation of the three components of the vector from satellite to
    ** position on earth surface (long,lat).*/
    r = (radius_p) / hypot(radius_p * cos(lp.phi), sin(lp.phi));
    Vx = r * cos(lp.lam) * cos(lp.phi);
    Vy = r * sin(lp.lam) * cos(lp.phi);
    Vz = r * sin(lp.phi);

    /* Check visibility. */
    if (((radius_g - Vx) * Vx - Vy * Vy - Vz * Vz * radius_p_inv2) < 0.) {
      e_error(-51);
    }

    /* Calculation based on view angles from satellite. */
    tmp = radius_g - Vx;
    if (flip_axis) {
      xy.x = radius_g_1 * atan(Vy / hypot(Vz, tmp));
      xy.y = radius_g_1 * atan(Vz / tmp);
    } else {
      xy.x = radius_g_1 * atan(Vy / tmp);
      xy.y = radius_g_1 * atan(Vz / hypot(Vy, tmp));
    }
  }

  function e_inv(xy, lp) {
    var Vx, Vy, Vz, a, b, k;

    /* Setting three components of vector from satellite to position.*/
    Vx = -1;

    if (flip_axis) {
      Vz = tan(xy.y / radius_g_1);
      Vy = tan(xy.x / radius_g_1) * hypot(1, Vz);
    } else {
      Vy = tan(xy.x / radius_g_1);
      Vz = tan(xy.y / radius_g_1) * hypot(1, Vy);
    }

    /* Calculation of terms in cubic equation and determinant.*/
    a = Vz / radius_p;
    a = Vy * Vy + a * a + Vx * Vx;
    b = 2 * radius_g * Vx;
    var det = (b * b) - 4 * a * C;
    if (det < 0) {
      e_error(-51);
    }

    /* Calculation of three components of vector from satellite to position.*/
    k = (-b - sqrt(det)) / (2 * a);
    Vx = radius_g + k * Vx;
    Vy *= k;
    Vz *= k;

    /* Calculation of longitude and latitude.*/
    lp.lam = atan2(Vy, Vx);
    lp.phi = atan(Vz * cos(lp.lam) / Vx);
    lp.phi = atan(radius_p_inv2 * tan(lp.phi));
  }
}
