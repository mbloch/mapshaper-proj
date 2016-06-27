/* @requires aasincos */

pj_add(pj_moll, 'moll', 'Mollweide', '\n\tPCyl Sph');
pj_add(pj_wag4, 'wag4', 'Wagner IV', '\n\tPCyl Sph');
pj_add(pj_wag5, 'wag5', 'Wagner V', '\n\tPCyl Sph');

function pj_moll(P) {
  pj_moll_init_Q(P, M_HALFPI);
  pj_moll_init(P);
}

function pj_wag4(P) {
  pj_moll_init_Q(P, M_PI/3);
  pj_moll_init(P);
}

function pj_wag5(P) {
  P.opaque = {
    C_x: 0.90977,
    C_y: 1.65014,
    C_p: 3.00896
  };
  pj_moll_init(P);
}

function pj_moll_init_Q(P, p) {
  var sp = sin(p),
      p2 = p + p,
      r = sqrt(M_TWOPI * sp / (p2 + sin(p2)));
  P.opaque = {
    C_x: 2 * r / M_PI,
    C_y: r / sp,
    C_p: p2 + sin(p2)
  };
}

function pj_moll_init(P) {
  var MAX_ITER = 10,
      LOOP_TOL = 1e-7,
      Q = P.opaque;
  P.fwd = s_fwd;
  P.inv = s_inv;
  P.es = 0;

  function s_fwd(lp, xy) {
    var k, V, i;
    k = Q.C_p * sin(lp.phi);
    for (i = MAX_ITER; i;--i) {
      lp.phi -= V = (lp.phi + sin(lp.phi) - k) /
        (1 + cos(lp.phi));
      if (fabs(V) < LOOP_TOL)
        break;
    }
    if (!i)
      lp.phi = (lp.phi < 0) ? -M_HALFPI : M_HALFPI;
    else
      lp.phi *= 0.5;
    xy.x = Q.C_x * lp.lam * cos(lp.phi);
    xy.y = Q.C_y * sin(lp.phi);
  }

  function s_inv(xy, lp) {
    lp.phi = aasin(xy.y / Q.C_y);
    lp.lam = xy.x / (Q.C_x * cos(lp.phi));
    if (fabs(lp.lam) < M_PI) {
      lp.phi += lp.phi;
      lp.phi = aasin((lp.phi + sin(lp.phi)) / Q.C_p);
    } else {
      lp.lam = lp.phi = HUGE_VAL;
    }
  }
}
