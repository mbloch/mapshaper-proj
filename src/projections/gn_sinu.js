/* @requires pj_mlfn aasincos */

pj_add(pj_gn_sinu, 'gn_sinu', 'General Sinusoidal Series', '\n\tPCyl, Sph.\n\tm= n=');
pj_add(pj_sinu, 'sinu', 'Sinusoidal (Sanson-Flamsteed)', '\n\tPCyl, Sph&Ell');
pj_add(pj_eck6, 'eck6', 'Eckert VI', '\n\tPCyl, Sph.\n\tm= n=');
pj_add(pj_mbtfps, 'mbtfps', 'McBryde-Thomas Flat-Polar Sinusoidal', '\n\tPCyl, Sph.');

function pj_gn_sinu(P) {
  if (pj_param(P.params, 'tn'), pj_param(P.params, 'tm')) {
    pj_sinu_init(P, pj_param(P.params, 'dm'), pj_param(P.params, 'dn'));
  } else {
    e_error(-99);
  }
}

function pj_sinu(P) {
  var en;
  if (P.es) {
    en = pj_enfn(P.es);
    P.fwd = e_fwd;
    P.inv = e_inv;
  } else {
    pj_sinu_init(P, 0, 1);
  }

  function e_fwd(lp, xy) {
    var s, c;
    xy.y = pj_mlfn(lp.phi, s = sin(lp.phi), c = cos(lp.phi), en);
    xy.x = lp.lam * c / sqrt(1 - P.es * s * s);
  }

  function e_inv(xy, lp) {
    var s = fabs(lp.phi = pj_inv_mlfn(xy.y, P.es, en));
    if (s < M_HALFPI) {
        s = sin(lp.phi);
        lp.lam = xy.x * sqrt(1 - P.es * s * s) / cos(lp.phi);
    } else if ((s - EPS10) < M_HALFPI) {
        lp.lam = 0;
    } else {
        i_error();
    }
  }
}

function pj_eck6(P) {
  pj_sinu_init(P, 1, 2.570796326794896619231321691);
}

function pj_mbtfps(P) {
  pj_sinu_init(P, 0.5, 1.785398163397448309615660845);
}

function pj_sinu_init(P, m, n) {
  var MAX_ITER = 8,
      LOOP_TOL = 1e-7,
      C_x, C_y;
  C_x = (C_y = sqrt((m + 1) / n))/(m + 1);
  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    var k, V, i;
    if (!m)
      lp.phi = n != 1 ? aasin(n * sin(lp.phi)): lp.phi;
    else {
        k = n * sin(lp.phi);
        for (i = MAX_ITER; i ; --i) {
            lp.phi -= V = (m * lp.phi + sin(lp.phi) - k) /
                (m + cos(lp.phi));
            if (fabs(V) < LOOP_TOL)
                break;
        }
        if (!i)
          f_error();
    }
    xy.x = C_x * lp.lam * (m + cos(lp.phi));
    xy.y = C_y * lp.phi;
  }

  function s_inv(xy, lp) {
    xy.y /= C_y;
    lp.phi = m ? aasin((m * xy.y + sin(xy.y)) / n) :
        ( n != 1 ? aasin(sin(xy.y) / n) : xy.y );
    lp.lam = xy.x / (C_x * (m + cos(xy.y)));
  }
}
