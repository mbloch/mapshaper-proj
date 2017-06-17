/* @require pj_qsfn pj_msfn */
pj_add(pj_healpix, 'healpix', 'HEALPix', '\n\tSph., Ellps.');
pj_add(pj_rhealpix, 'rhealpix', 'rHEALPix', '\n\tSph., Ellps.\n\tnorth_square= south_square=');

function pj_rhealpix(P) {
  pj_healpix(P, true);
}

function pj_healpix(P, rhealpix) {
  var R1 = [
    [0, -1],
    [1, 0]
  ];
  var R2 = [
    [-1, 0],
    [0, -1]
  ];
  var R3 = [
    [0, 1],
    [-1, 0]
  ];
  var IDENT = [
    [1, 0],
    [0, 1]
  ];
  var rot = [IDENT, R1, R2, R3, R3, R2, R1];
  var EPS = 1e-15;

  var north_square;
  var south_square;
  var qp;
  var apa;
  var vertsJit;

  if (rhealpix) {
    north_square = pj_param(P.params, "inorth_square");
    south_square = pj_param(P.params, "isouth_square");

    /* Check for valid north_square and south_square inputs. */
    if (north_square < 0 || north_square > 3) {
      e_error(-47);
    }
    if (south_square < 0 || south_square > 3) {
      e_error(-47);
    }
    vertsJit = [
      [-M_PI - EPS, M_FORTPI + EPS],
      [-M_PI + north_square * M_HALFPI - EPS, M_FORTPI + EPS],
      [-M_PI + north_square * M_HALFPI - EPS, 3 * M_FORTPI + EPS],
      [-M_PI + (north_square + 1.0) * M_HALFPI + EPS, 3 * M_FORTPI + EPS],
      [-M_PI + (north_square + 1.0) * M_HALFPI + EPS, M_FORTPI + EPS],
      [M_PI + EPS, M_FORTPI + EPS],
      [M_PI + EPS, -M_FORTPI - EPS],
      [-M_PI + (south_square + 1.0) * M_HALFPI + EPS, -M_FORTPI - EPS],
      [-M_PI + (south_square + 1.0) * M_HALFPI + EPS, -3 * M_FORTPI - EPS],
      [-M_PI + south_square * M_HALFPI - EPS, -3 * M_FORTPI - EPS],
      [-M_PI + south_square * M_HALFPI - EPS, -M_FORTPI - EPS],
      [-M_PI - EPS, -M_FORTPI - EPS]
    ];

    if (P.es != 0.0) {
      apa = pj_authset(P.es); /* For auth_lat(). */
      qp = pj_qsfn(1.0, P.e, P.one_es); /* For auth_lat(). */
      P.a = P.a * sqrt(0.5 * qp); /* Set P.a to authalic radius. */
      P.ra = 1.0 / P.a;
      P.fwd = e_rhealpix_forward;
      P.inv = e_rhealpix_inverse;
    } else {
      P.fwd = s_rhealpix_forward;
      P.inv = s_rhealpix_inverse;
    }

  } else { // healpix
    vertsJit = [
      [-M_PI - EPS, M_FORTPI],
      [-3 * M_FORTPI, M_HALFPI + EPS],
      [-M_HALFPI, M_FORTPI + EPS],
      [-M_FORTPI, M_HALFPI + EPS],
      [0.0, M_FORTPI + EPS],
      [M_FORTPI, M_HALFPI + EPS],
      [M_HALFPI, M_FORTPI + EPS],
      [3 * M_FORTPI, M_HALFPI + EPS],
      [M_PI + EPS, M_FORTPI],
      [M_PI + EPS, -M_FORTPI],
      [3 * M_FORTPI, -M_HALFPI - EPS],
      [M_HALFPI, -M_FORTPI - EPS],
      [M_FORTPI, -M_HALFPI - EPS],
      [0.0, -M_FORTPI - EPS],
      [-M_FORTPI, -M_HALFPI - EPS],
      [-M_HALFPI, -M_FORTPI - EPS],
      [-3 * M_FORTPI, -M_HALFPI - EPS],
      [-M_PI - EPS, -M_FORTPI]
    ];

    if (P.es != 0.0) {
      apa = pj_authset(P.es); /* For auth_lat(). */
      qp = pj_qsfn(1.0, P.e, P.one_es); /* For auth_lat(). */
      P.a = P.a * sqrt(0.5 * qp); /* Set P.a to authalic radius. */
      P.ra = 1.0 / P.a;
      P.fwd = e_healpix_forward;
      P.inv = e_healpix_inverse;
    } else {
      P.fwd = s_healpix_forward;
      P.inv = s_healpix_inverse;
    }
  }

  function s_healpix_forward(lp, xy) {
    healpix_sphere(lp, xy);
  }

  function e_healpix_forward(lp, xy) {
    lp.phi = auth_lat(P, lp.phi, 0);
    healpix_sphere(lp, xy);
  }

  function s_healpix_inverse(xy, lp) {
    if (!in_image(xy.x, xy.y)) {
      lp.lam = HUGE_VAL;
      lp.phi = HUGE_VAL;
      pj_ctx_set_errno(-15);
      return;
    }
    healpix_sphere_inverse(xy, lp);
  }

  function e_healpix_inverse(xy, lp) {
    if (!in_image(xy.x, xy.y)) {
      lp.lam = HUGE_VAL;
      lp.phi = HUGE_VAL;
      pj_ctx_set_errno(-15);
      return;
    }
    healpix_sphere_inverse(xy, lp);
    lp.phi = auth_lat(P, lp.phi, 1);
  }

  function s_rhealpix_forward(lp, xy) {
    healpix_sphere(lp, xy);
    combine_caps(xy, north_square, south_square, 0);
  }

  function e_rhealpix_forward(lp, xy) {
    lp.phi = auth_lat(P, lp.phi, 0);
    healpix_sphere(lp, xy);
    return combine_caps(xy, north_square, south_square, 0);
  }

  function s_rhealpix_inverse(xy, lp) {
    if (!in_image(xy.x, xy.y)) {
      lp.lam = HUGE_VAL;
      lp.phi = HUGE_VAL;
      pj_ctx_set_errno(-15);
      return;
    }
    combine_caps(xy, north_square, south_square, 1);
    healpix_sphere_inverse(xy, lp);
  }

  function e_rhealpix_inverse(xy, lp) {
    if (!in_image(xy.x, xy.y)) {
      lp.lam = HUGE_VAL;
      lp.phi = HUGE_VAL;
      pj_ctx_set_errno(-15);
      return;
    }
    combine_caps(xy, north_square, south_square, 1);
    healpix_sphere_inverse(xy, lp);
    lp.phi = auth_lat(P, lp.phi, 1);
  }

  function healpix_sphere(lp, xy) {
    var lam = lp.lam;
    var phi = lp.phi;
    var phi0 = asin(2.0 / 3.0);

    /* equatorial region */
    if (fabs(phi) <= phi0) {
      xy.x = lam;
      xy.y = 3 * M_PI / 8 * sin(phi);
    } else {
      var lamc;
      var sigma = sqrt(3 * (1 - fabs(sin(phi))));
      var cn = floor(2 * lam / M_PI + 2);
      if (cn >= 4) {
        cn = 3;
      }
      lamc = -3 * M_FORTPI + M_HALFPI * cn;
      xy.x = lamc + (lam - lamc) * sigma;
      xy.y = pj_sign(phi) * M_FORTPI * (2 - sigma);
    }
  }

  function healpix_sphere_inverse(xy, lp) {
    var x = xy.x;
    var y = xy.y;
    var y0 = M_FORTPI;

    /* Equatorial region. */
    if (fabs(y) <= y0) {
      lp.lam = x;
      lp.phi = asin(8 * y / (3 * M_PI));
    } else if (fabs(y) < M_HALFPI) {
      var cn = floor(2 * x / M_PI + 2);
      var xc, tau;
      if (cn >= 4) {
        cn = 3;
      }
      xc = -3 * M_FORTPI + M_HALFPI * cn;
      tau = 2.0 - 4 * fabs(y) / M_PI;
      lp.lam = xc + (x - xc) / tau;
      lp.phi = pj_sign(y) * asin(1.0 - pow(tau, 2) / 3.0);
    } else {
      lp.lam = -M_PI;
      lp.phi = pj_sign(y) * M_HALFPI;
    }
  }

  function pj_sign(v) {
    return v > 0 ? 1 : (v < 0 ? -1 : 0);
  }

  /**
   * Return the index of the matrix in ROT.
   * @param index ranges from -3 to 3.
   */
  function get_rotate_index(index) {
    switch (index) {
      case 0:
        return 0;
      case 1:
        return 1;
      case 2:
        return 2;
      case 3:
        return 3;
      case -1:
        return 4;
      case -2:
        return 5;
      case -3:
        return 6;
    }
    return 0;
  }

  /**
   * Return true if point (testx, testy) lies in the interior of the polygon
   * determined by the vertices in vert, and return false otherwise.
   * See http://paulbourke.net/geometry/polygonmesh/ for more details.
   * @param nvert the number of vertices in the polygon.
   * @param vert the (x, y)-coordinates of the polygon's vertices
   **/
  function pnpoly(vert, testx, testy) {
    var counter = 0;
    var nvert = vert.length;
    var x1, y1, x2, y2;
    var xinters;
    var i;

    /* Check for boundary cases */
    for (i = 0; i < nvert; i++) {
      if (testx == vert[i][0] && testy == vert[i][1]) {
        return true;
      }
    }

    x1 = vert[0][0];
    y1 = vert[0][1];

    for (i = 1; i < nvert; i++) {
      x2 = vert[i % nvert][0];
      y2 = vert[i % nvert][1];
      if (testy > MIN(y1, y2) &&
        testy <= MAX(y1, y2) &&
        testx <= MAX(x1, x2) &&
        y1 != y2) {
        xinters = (testy - y1) * (x2 - x1) / (y2 - y1) + x1;
        if (x1 == x2 || testx <= xinters)
          counter++;
      }
      x1 = x2;
      y1 = y2;
    }
    return counter % 2 != 0;
  }

  function in_image(x, y) {
    return pnpoly(vertsJit, x, y);
  }

  /**
   * Return the authalic latitude of latitude alpha (if inverse=0) or
   * return the approximate latitude of authalic latitude alpha (if inverse=1).
   * P contains the relevant ellipsoid parameters.
   **/
  function auth_lat(P, alpha, inverse) {
    if (!inverse) {
      /* Authalic latitude. */
      var q = pj_qsfn(sin(alpha), P.e, 1.0 - P.es);
      var ratio = q / qp;

      if (fabs(ratio) > 1) {
        /* Rounding error. */
        ratio = pj_sign(ratio);
      }
      return asin(ratio);
    } else {
      /* Approximation to inverse authalic latitude. */
      return pj_authlat(alpha, apa);
    }
  }

  function vector_add(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
  }

  function vector_sub(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
  }

  function dot_product(a, b) {
    var i, j;
    var ret = [0, 0];
    for (i = 0; i < 2; i++) {
      for (j = 0; j < 2; j++) {
        ret[i] += a[i][j] * b[j];
      }
    }
    return ret;
  }

  /**
   * Return the number of the polar cap, the pole point coordinates, and
   * the region that (x, y) lies in.
   * If inverse=0, then assume (x,y) lies in the image of the HEALPix
   * projection of the unit sphere.
   * If inverse=1, then assume (x,y) lies in the image of the
   * (north_square, south_square)-rHEALPix projection of the unit sphere.
   **/
  function get_cap(x, y, north_square, south_square, inverse) {
    var capmap = {};
    var c;
    capmap.x = x;
    capmap.y = y;
    if (!inverse) {
      if (y > M_FORTPI) {
        capmap.region = 'north';
        c = M_HALFPI;
      } else if (y < -M_FORTPI) {
        capmap.region = 'south';
        c = -M_HALFPI;
      } else {
        capmap.region = 'equatorial';
        capmap.cn = 0;
        return capmap;
      }
      /* polar region */
      if (x < -M_HALFPI) {
        capmap.cn = 0;
        capmap.x = (-3 * M_FORTPI);
        capmap.y = c;
      } else if (x >= -M_HALFPI && x < 0) {
        capmap.cn = 1;
        capmap.x = -M_FORTPI;
        capmap.y = c;
      } else if (x >= 0 && x < M_HALFPI) {
        capmap.cn = 2;
        capmap.x = M_FORTPI;
        capmap.y = c;
      } else {
        capmap.cn = 3;
        capmap.x = 3 * M_FORTPI;
        capmap.y = c;
      }
    } else {
      if (y > M_FORTPI) {
        capmap.region = 'north';
        capmap.x = -3 * M_FORTPI + north_square * M_HALFPI;
        capmap.y = M_HALFPI;
        x = x - north_square * M_HALFPI;
      } else if (y < -M_FORTPI) {
        capmap.region = 'south';
        capmap.x = -3 * M_FORTPI + south_square * M_HALFPI;
        capmap.y = -M_HALFPI;
        x = x - south_square * M_HALFPI;
      } else {
        capmap.region = 'equatorial';
        capmap.cn = 0;
        return capmap;
      }
      /* Polar Region, find the HEALPix polar cap number that
         x, y moves to when rHEALPix polar square is disassembled. */
      if (capmap.region == 'north') {
        if (y >= -x - M_FORTPI - EPS && y < x + 5 * M_FORTPI - EPS) {
          capmap.cn = (north_square + 1) % 4;
        } else if (y > -x - M_FORTPI + EPS && y >= x + 5 * M_FORTPI - EPS) {
          capmap.cn = (north_square + 2) % 4;
        } else if (y <= -x - M_FORTPI + EPS && y > x + 5 * M_FORTPI + EPS) {
          capmap.cn = (north_square + 3) % 4;
        } else {
          capmap.cn = north_square;
        }
      } else if (capmap.region == 'south') {
        if (y <= x + M_FORTPI + EPS && y > -x - 5 * M_FORTPI + EPS) {
          capmap.cn = (south_square + 1) % 4;
        } else if (y < x + M_FORTPI - EPS && y <= -x - 5 * M_FORTPI + EPS) {
          capmap.cn = (south_square + 2) % 4;
        } else if (y >= x + M_FORTPI - EPS && y < -x - 5 * M_FORTPI - EPS) {
          capmap.cn = (south_square + 3) % 4;
        } else {
          capmap.cn = south_square;
        }
      }
    }
    return capmap;
  }

  /**
   * Rearrange point (x, y) in the HEALPix projection by
   * combining the polar caps into two polar squares.
   * Put the north polar square in position north_square and
   * the south polar square in position south_square.
   * If inverse=1, then uncombine the polar caps.
   * @param north_square integer between 0 and 3.
   * @param south_square integer between 0 and 3.
   **/
  function combine_caps(xy, north_square, south_square, inverse) {
    var v, c, vector, v_min_c, ret_dot, tmpRot, a;
    var pole = 0;
    var capmap = get_cap(xy.x, xy.y, north_square, south_square, inverse);
    if (capmap.region == 'equatorial') {
      xy.x = capmap.x;
      xy.y = capmap.y;
      return;
    }
    v = [xy.x, xy.y];
    c = [capmap.x, capmap.y];

    if (!inverse) {
      /* Rotate (x, y) about its polar cap tip and then translate it to
         north_square or south_square. */

      if (capmap.region == 'north') {
        pole = north_square;
        tmpRot = rot[get_rotate_index(capmap.cn - pole)];
      } else {
        pole = south_square;
        tmpRot = rot[get_rotate_index(-1 * (capmap.cn - pole))];
      }
    } else {
      /* Inverse function.
       Unrotate (x, y) and then translate it back. */

      /* disassemble */
      if (capmap.region == 'north') {
        pole = north_square;
        tmpRot = rot[get_rotate_index(-1 * (capmap.cn - pole))];
      } else {
        pole = south_square;
        tmpRot = rot[get_rotate_index(capmap.cn - pole)];
      }
    }
    v_min_c = vector_sub(v, c);
    ret_dot = dot_product(tmpRot, v_min_c);
    a = [-3 * M_FORTPI + ((!inverse) ? 0 : capmap.cn) * M_HALFPI, M_HALFPI];
    vector = vector_add(ret_dot, a);
    xy.x = vector[0];
    xy.y = vector[1];
  }
}
