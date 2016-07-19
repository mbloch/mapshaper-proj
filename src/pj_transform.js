/* @requires pj_geocent */

// A convenience function for transforming a single point (not in Proj.4)
// @p an array containing [x, y] or [x, y, z] coordinates
//     latlong coordinates are assumed to be in decimal degrees
function pj_transform_point(srcdefn, dstdefn, p) {
  var z = p.length > 2,
      xx = [p[0]],
      yy = [p[1]],
      zz = [z ? p[2] : 0];
  if (srcdefn.is_latlong) {
    xx[0] *= DEG_TO_RAD;
    yy[0] *= DEG_TO_RAD;
  }
  ctx.last_errno = 0;
  pj_transform(srcdefn, dstdefn, xx, yy, zz);
  if (ctx.last_errno || xx[0] == HUGE_VAL) {
    // throw error if translation fails
    fatal(null, {point: p});
  }
  if (dstdefn.is_latlong) {
    xx[0] *= RAD_TO_DEG;
    yy[0] *= RAD_TO_DEG;
  }
  p[0] = xx[0];
  p[1] = yy[0];
  if (z) p[2] = zz[0];
}

// Transform arrays of coordinates; latlong coords are in radians
// @xx, @yy[, @zz] coordinate arrays
//
function pj_transform(srcdefn, dstdefn, xx, yy, zz) {
  var point_count = xx.length;
  var lp = {};
  var xy = {};
  var err, i, tmp;

  if (srcdefn.axis != 'enu') {
    pj_adjust_axis(srcdefn.axis, false, xx, yy, zz);
  }

  if (srcdefn.vto_meter != 1 && zz) {
   for ( i = 0; i < point_count; i++ )
      zz[i] *= srcdefn.vto_meter;
  }

  // convert to lat/lng, if needed
  if (srcdefn.is_geocent) {
    if (!zz) {
      error(PJD_ERR_GEOCENTRIC);
    }
    if (srcdefn.to_meter != 1) {
      for (i = 0; i < point_count; i++) {
        if (xx[i] != HUGE_VAL ) {
          xx[i] *= srcdefn.to_meter;
          yy[i] *= srcdefn.to_meter;
        }
      }
    }
    pj_geocentric_to_geodetic(srcdefn.a_orig, srcdefn.es_orig, xx, yy, zz);

  } else if (!srcdefn.is_latlong) {
    if (!srcdefn.inv3d && !srcdefn.inv) {
      // Proj.4 returns error code -17 (a bug?)
      fatal("source projection not invertible");
    }
    if (srcdefn.inv3d) {
      fatal("inverse 3d transformations not supported");
    } else {
      for (i=0; i<point_count; i++) {
        xy.x = xx[i];
        xy.y = yy[i];
        tmp = pj_inv(xy, srcdefn);
        xx[i] = tmp.lam;
        yy[i] = tmp.phi;
        check_fatal_error(); // Proj.4 is a bit different
      }
    }
  }

  if (srcdefn.from_greenwich !== 0) {
    for (i=0; i<point_count; i++) {
      if (xx[i] != HUGE_VAL) {
        xx[i] += srcdefn.from_greenwich;
      }
    }
  }

  if (srcdefn.has_geoid_vgrids && zz) {
    fatal("vgrid transformation not supported");
  }

  pj_datum_transform(srcdefn, dstdefn, xx, yy, zz);

  if (dstdefn.has_geoid_vgrids && zz) {
    fatal("vgrid transformation not supported");
  }

  if (dstdefn.from_greenwich !== 0) {
    for (i=0; i<point_count; i++) {
      if (xx[i] != HUGE_VAL) {
        xx[i] -= dstdefn.from_greenwich;
      }
    }
  }

  if (dstdefn.is_geocent) {
    if (!zz) {
      error(PJD_ERR_GEOCENTRIC);
    }
    pj_geodetic_to_geocentric(dstdefn.a_orig, dstdefn.es_orig, xx, yy, zz);

    if (dstdefn.fr_meter != 1) {
      for (i = 0; i<point_count; i++) {
        if (xx[i] != HUGE_VAL) {
          xx[i] *= dstdefn.fr_meter;
          yy[i] *= dstdefn.fr_meter;
        }
      }
    }
  } else if (!dstdefn.is_latlong) {
    if (dstdefn.fwd3d) {
      fatal("3d transformation not supported");
    } else {
      for (i=0; i<point_count; i++) {
        lp.lam = xx[i];
        lp.phi = yy[i];
        tmp = pj_fwd(lp, dstdefn);
        xx[i] = tmp.x;
        yy[i] = tmp.y;
        check_fatal_error(); // Proj.4 is a bit different
      }
    }
  } else if (dstdefn.is_latlong && dstdefn.is_long_wrap_set) {
    for (i=0; i<point_count; i++) {
      if (xx[i] == HUGE_VAL) continue;
      while (xx[i] < dstdefn.long_wrap_center - M_PI) {
        xx[i] += M_TWOPI;
      }
      while (xx[i] > dstdefn.long_wrap_center + M_PI) {
        xx[i] -= M_TWOPI;
      }
    }
  }

  if (dstdefn.vto_meter != 1 && zz) {
    for (i=0; i<point_count; i++) {
      zz[i] *= dstdefn.vfr_meter;
    }
  }
  if (dstdefn.axis != 'enu') {
    pj_adjust_axis(dstdefn.axis, true, xx, yy, zz);
  }

  return point_count == 1 ? ctx.last_errno : 0;
}

function pj_adjust_axis(axis, denormalize_flag, xx, yy, zz) {
  var point_count = xx.length;
  var x_in, y_in, z_in = 0;
  var i, i_axis, value, target;

  if (!denormalize_flag) {
    for (i = 0; i < point_count; i++) {
      x_in = xx[i];
      y_in = yy[i];
      if (x_in == HUGE_VAL) continue; // not in Proj.4
      if (zz)
        z_in = zz[i];

      for (i_axis = 0; i_axis < 3; i_axis++) {
        if (i_axis == 0)
            value = x_in;
        else if (i_axis == 1)
            value = y_in;
        else
            value = z_in;

        switch (axis[i_axis]) {
          case 'e':
            xx[i] = value; break;
          case 'w':
            xx[i] = -value; break;
          case 'n':
            yy[i] = value; break;
          case 's':
            yy[i] = -value; break;
          case 'u':
            if( zz ) zz[i] = value; break;
          case 'd':
            if( zz ) zz[i] = -value; break;
          default:
            error(PJD_ERR_AXIS);
        }
      } /* i_axis */
    } /* i (point) */
  }

  else {/* denormalize */
    for (i = 0; i < point_count; i++) {
      x_in = xx[i];
      y_in = yy[i];
      if (x_in == HUGE_VAL) continue; // not in Proj.4
      if (zz)
        z_in = zz[i];
      for (i_axis = 0; i_axis < 3; i_axis++) {
        if (i_axis == 2 && !zz)
          continue;
        if (i_axis == 0)
            target = xx;
        else if (i_axis == 1)
            target = yy;
        else
            target = zz;
        switch (axis[i_axis]) {
          case 'e':
            target[i] = x_in; break;
          case 'w':
            target[i] = -x_in; break;
          case 'n':
            target[i] = y_in; break;
          case 's':
            target[i] = -y_in; break;
          case 'u':
            target[i] = z_in; break;
          case 'd':
            target[i] = -z_in; break;
          default:
            error(PJD_ERR_AXIS);
        }
      } /* i_axis */
    } /* i (point) */
  }
}

function pj_datum_transform(srcdefn, dstdefn, xx, yy, zz) {
  var point_count = xx.length;
  var src_a, src_es, dst_a, dst_es;
  var z_is_temp = false;
  /*      We cannot do any meaningful datum transformation if either      */
  /*      the source or destination are of an unknown datum type          */
  /*      (ie. only a +ellps declaration, no +datum).  This is new        */
  /*      behavior for PROJ 4.6.0                                        */
  if (srcdefn.datum_type == PJD_UNKNOWN || dstdefn.datum_type == PJD_UNKNOWN) {
    return;
  }

  /*      Short cut if the datums are identical.                          */
  if (pj_compare_datums(srcdefn, dstdefn)) {
    return;
  }
  src_a = srcdefn.a_orig;
  src_es = srcdefn.es_orig;
  dst_a = dstdefn.a_orig;
  dst_es = dstdefn.es_orig;
  /*      Create a temporary Z array if one is not provided.              */
  if (!zz) {
    zz = new Float64Array(point_count);
    z_is_temp = true;
  }

  if (srcdefn.datum_type == PJD_GRIDSHIFT) {
    fatal("gridshift not implemented");
    // pj_apply_gridshift_2()
    src_a = SRS_WGS84_SEMIMAJOR;
    src_es = SRS_WGS84_ESQUARED;
  }

  if (dstdefn.datum_type == PJD_GRIDSHIFT) {
    dst_a = SRS_WGS84_SEMIMAJOR;
    dst_es = SRS_WGS84_ESQUARED;
  }

  /*      Do we need to go through geocentric coordinates?                */
  if (src_es != dst_es || src_a != dst_a ||
      srcdefn.datum_type == PJD_3PARAM || srcdefn.datum_type == PJD_7PARAM ||
      dstdefn.datum_type == PJD_3PARAM || dstdefn.datum_type == PJD_7PARAM) {

    pj_geodetic_to_geocentric(src_a, src_es, xx, yy, zz);

    if (srcdefn.datum_type == PJD_3PARAM || srcdefn.datum_type == PJD_7PARAM) {
      pj_geocentric_to_wgs84(srcdefn, xx, yy, zz);
    }

    if (dstdefn.datum_type == PJD_3PARAM || dstdefn.datum_type == PJD_7PARAM) {
      pj_geocentric_from_wgs84(dstdefn, xx, yy, zz);
    }

    /*      Convert back to geodetic coordinates.                           */
    pj_geocentric_to_geodetic(dst_a, dst_es, xx, yy, zz);

    /*      Apply grid shift to destination if required.                    */
    if (dstdefn.datum_type == PJD_GRIDSHIFT) {
      pj_apply_gridshift_2(dstdefn, 1, xx, yy, zz);
    }
  }
}

// returns true if datums are equivalent
function pj_compare_datums(srcdefn, dstdefn) {
  if (srcdefn.datum_type != dstdefn.datum_type) return false;
  if (srcdefn.a_orig != dstdefn.a_orig ||
    Math.abs(srcdefn.es_orig - dstdefn.es_orig) > 0.000000000050) {
    /* the tolerance for es is to ensure that GRS80 and WGS84 are considered identical */
    return false;
  }
  if (srcdefn.datum_type == PJD_3PARAM) {
    return (srcdefn.datum_params[0] == dstdefn.datum_params[0] &&
        srcdefn.datum_params[1] == dstdefn.datum_params[1] &&
        srcdefn.datum_params[2] == dstdefn.datum_params[2]);
  }
  if (srcdefn.datum_type == PJD_7PARAM) {
    return (srcdefn.datum_params[0] == dstdefn.datum_params[0] &&
      srcdefn.datum_params[1] == dstdefn.datum_params[1] &&
      srcdefn.datum_params[2] == dstdefn.datum_params[2] &&
      srcdefn.datum_params[3] == dstdefn.datum_params[3] &&
      srcdefn.datum_params[4] == dstdefn.datum_params[4] &&
      srcdefn.datum_params[5] == dstdefn.datum_params[5] &&
      srcdefn.datum_params[6] == dstdefn.datum_params[6]);
  }
  if (srcdefn.datum_type == PJD_GRIDSHIFT) {
    return pj_param(srcdefn.params, "snadgrids") ==
        pj_param(dstdefn.params, "snadgrids");
  }
  return true;
}

function pj_geocentric_to_wgs84(defn, xx, yy, zz) {
  var point_count = xx.length,
      pp = defn.datum_params,
      Dx_BF = pp[0],
      Dy_BF = pp[1],
      Dz_BF = pp[2],
      x, y, z, Rx_BF, Ry_BF, Rz_BF, M_BF,
      i;

  if (defn.datum_type == PJD_3PARAM) {
    for (i=0; i<point_count; i++) {
      if (xx[i] == HUGE_VAL) continue;
      xx[i] += Dx_BF;
      yy[i] += Dy_BF;
      zz[i] += Dz_BF;
    }
  } else if (defn.datum_type == PJD_7PARAM) {
    Rx_BF = pp[3];
    Ry_BF = pp[4];
    Rz_BF = pp[5];
    M_BF = pp[6];
    for (i=0; i<point_count; i++) {
      if (xx[i] == HUGE_VAL) continue;
      x = M_BF * (xx[i] - Rz_BF * yy[i] + Ry_BF *  zz[i]) + Dx_BF;
      y = M_BF * (Rz_BF * xx[i] + yy[i] - Rx_BF * zz[i]) + Dy_BF;
      z = M_BF * (-Ry_BF * xx[i] + Rx_BF * yy[i] + zz[i]) + Dz_BF;
      xx[i] = x;
      yy[i] = y;
      zz[i] = z;
    }
  }
}

function pj_geocentric_from_wgs84(defn, xx, yy, zz) {
  var point_count = xx.length,
      pp = defn.datum_params,
      Dx_BF = pp[0],
      Dy_BF = pp[1],
      Dz_BF = pp[2],
      x, y, z, Rx_BF, Ry_BF, Rz_BF, M_BF,
      i;

  if (defn.datum_type == PJD_3PARAM) {
    for (i=0; i<point_count; i++) {
      if (xx[i] == HUGE_VAL) continue;
      xx[i] -= Dx_BF;
      yy[i] -= Dy_BF;
      zz[i] -= Dz_BF;
    }
  } else if (defn.datum_type == PJD_7PARAM) {
    Rx_BF = pp[3];
    Ry_BF = pp[4];
    Rz_BF = pp[5];
    M_BF = pp[6];
    for (i=0; i<point_count; i++) {
      if (xx[i] == HUGE_VAL) continue;
      x = (xx[i] - Dx_BF) / M_BF;
      y = (yy[i] - Dy_BF) / M_BF;
      z = (zz[i] - Dz_BF) / M_BF;
      xx[i] = x + Rz_BF * y - Ry_BF * z;
      yy[i] = -Rz_BF * x + y + Rx_BF * z;
      zz[i] = Ry_BF * x - Rx_BF * y + z;
    }
  }
}

function pj_geocentric_to_geodetic(a, es, xx, yy, zz) {
  var point_count = xx.length;
  var b, i, gi;
  if (es == 0.0)
    b = a;
  else
    b = a * sqrt(1-es);

  gi = pj_Set_Geocentric_Parameters(a, b);
  if (!gi) {
    error(PJD_ERR_GEOCENTRIC);
  }

  for (i = 0; i < point_count; i++) {
    if (xx[i] != HUGE_VAL) {
      pj_Convert_Geocentric_To_Geodetic(gi, i, xx, yy, zz);
    }
  }
}

function pj_geodetic_to_geocentric(a, es, xx, yy, zz) {
  var point_count = xx.length,
      b, i, gi;
  if (es === 0) {
    b = a;
  } else {
    b = a * sqrt(1 - es);
  }
  gi = pj_Set_Geocentric_Parameters(a, b);
  if (!gi) {
    error(PJD_ERR_GEOCENTRIC);
  }
  for (i=0; i<point_count; i++) {
    if (xx[i] == HUGE_VAL) continue;
    if (pj_Convert_Geodetic_To_Geocentric(gi, i, xx, yy, zz)) {
      xx[i] = yy[i] = HUGE_VAL;
    }
  }
}
