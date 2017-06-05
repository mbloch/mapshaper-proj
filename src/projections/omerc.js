/* @requires pj_phi2 */

pj_add(pj_omerc, 'omerc', 'Oblique Mercator', '\n\tCyl, Sph&Ell no_rot' +
    '\n\talpha= [gamma=] [no_off] lonc= or\n\t lon_1= lat_1= lon_2= lat_2=');

function pj_omerc(P) {
  var TOL = 1e-7;
  var con, com, cosph0, D, F, H, L, sinph0, p, J, gamma=0,
      gamma0, lamc=0, lam1=0, lam2=0, phi1=0, phi2=0, alpha_c=0;
  var alp, gam, no_off = 0;
  var A, B, E, AB, ArB, BrA, rB, singam, cosgam, sinrot, cosrot;
  var v_pole_n, v_pole_s, u_0;
  var no_rot;

  no_rot = pj_param(P.params, "tno_rot");
  if ((alp = pj_param(P.params, "talpha")) != 0)
  alpha_c = pj_param(P.params, "ralpha");
  if ((gam = pj_param(P.params, "tgamma")) != 0)
  gamma = pj_param(P.params, "rgamma");
  if (alp || gam) {
    lamc = pj_param(P.params, "rlonc");
    no_off =
      /* For libproj4 compatibility ... for backward compatibility */
      pj_param(P.params, "tno_off") || pj_param(P.params, "tno_uoff");
    if (no_off) {
      /* Mark the parameter as used, so that the pj_get_def() return them */
      pj_param(P.params, "sno_uoff");
      pj_param(P.params, "sno_off");
    }
  } else {
    lam1 = pj_param(P.params, "rlon_1");
    phi1 = pj_param(P.params, "rlat_1");
    lam2 = pj_param(P.params, "rlon_2");
    phi2 = pj_param(P.params, "rlat_2");
    if (fabs(phi1 - phi2) <= TOL || (con = fabs(phi1)) <= TOL ||
        fabs(con - M_HALFPI) <= TOL || fabs(fabs(P.phi0) - M_HALFPI) <= TOL ||
        fabs(fabs(phi2) - M_HALFPI) <= TOL) e_error(-33);
  }
  com = sqrt(P.one_es);
  if (fabs(P.phi0) > EPS10) {
    sinph0 = sin(P.phi0);
    cosph0 = cos(P.phi0);
    con = 1 - P.es * sinph0 * sinph0;
    B = cosph0 * cosph0;
    B = sqrt(1 + P.es * B * B / P.one_es);
    A = B * P.k0 * com / con;
    D = B * com / (cosph0 * sqrt(con));
    if ((F = D * D - 1) <= 0)
      F = 0;
    else {
      F = sqrt(F);
      if (P.phi0 < 0)
        F = -F;
    }
    E = F += D;
    E *= pow(pj_tsfn(P.phi0, sinph0, P.e), B);
  } else {
    B = 1 / com;
    A = P.k0;
    E = D = F = 1;
  }
  if (alp || gam) {
    if (alp) {
      gamma0 = asin(sin(alpha_c) / D);
      if (!gam)
          gamma = alpha_c;
    } else
        alpha_c = asin(D*sin(gamma0 = gamma));
    P.lam0 = lamc - asin(0.5 * (F - 1 / F) * tan(gamma0)) / B;
  } else {
    H = pow(pj_tsfn(phi1, sin(phi1), P.e), B);
    L = pow(pj_tsfn(phi2, sin(phi2), P.e), B);
    F = E / H;
    p = (L - H) / (L + H);
    J = E * E;
    J = (J - L * H) / (J + L * H);
    if ((con = lam1 - lam2) < -M_PI)
        lam2 -= M_TWOPI;
    else if (con > M_PI)
        lam2 += M_TWOPI;
    P.lam0 = adjlon(0.5 * (lam1 + lam2) - atan(J * tan(0.5 * B * (lam1 - lam2)) / p) / B);
    gamma0 = atan(2 * sin(B * adjlon(lam1 - P.lam0)) / (F - 1 / F));
    gamma = alpha_c = asin(D * sin(gamma0));
  }
  singam = sin(gamma0);
  cosgam = cos(gamma0);
  sinrot = sin(gamma);
  cosrot = cos(gamma);
  BrA = 1 / (ArB = A * (rB = 1 / B));
  AB = A * B;
  if (no_off)
    u_0 = 0;
  else {
    u_0 = fabs(ArB * atan(sqrt(D * D - 1) / cos(alpha_c)));
    if (P.phi0 < 0)
        u_0 = - u_0;
  }
  F = 0.5 * gamma0;
  v_pole_n = ArB * log(tan(M_FORTPI - F));
  v_pole_s = ArB * log(tan(M_FORTPI + F));

  P.fwd = e_fwd;
  P.inv = e_inv;

  function e_fwd(lp, xy) {
    var S, T, U, V, W, temp, u, v;

    if (fabs(fabs(lp.phi) - M_HALFPI) > EPS10) {
      W = E / pow(pj_tsfn(lp.phi, sin(lp.phi), P.e), B);
      temp = 1 / W;
      S = 0.5 * (W - temp);
      T = 0.5 * (W + temp);
      V = sin(B * lp.lam);
      U = (S * singam - V * cosgam) / T;
      if (fabs(fabs(U) - 1.0) < EPS10)
        f_error();
      v = 0.5 * ArB * log((1 - U)/(1 + U));
      temp = cos(B * lp.lam);
      if(fabs(temp) < TOL) {
          u = A * lp.lam;
      } else {
          u = ArB * atan2((S * cosgam + V * singam), temp);
      }
    } else {
        v = lp.phi > 0 ? v_pole_n : v_pole_s;
        u = ArB * lp.phi;
    }
    if (no_rot) {
        xy.x = u;
        xy.y = v;
    } else {
        u -= u_0;
        xy.x = v * cosrot + u * sinrot;
        xy.y = u * cosrot - v * sinrot;
    }
  }

  function e_inv(xy, lp) {
    var u, v, Qp, Sp, Tp, Vp, Up;
    if (no_rot) {
      v = xy.y;
      u = xy.x;
    } else {
      v = xy.x * cosrot - xy.y * sinrot;
      u = xy.y * cosrot + xy.x * sinrot + u_0;
    }
    Qp = exp(- BrA * v);
    Sp = 0.5 * (Qp - 1 / Qp);
    Tp = 0.5 * (Qp + 1 / Qp);
    Vp = sin(BrA * u);
    Up = (Vp * cosgam + Sp * singam) / Tp;
    if (fabs(fabs(Up) - 1) < EPS10) {
      lp.lam = 0;
      lp.phi = Up < 0 ? -M_HALFPI : M_HALFPI;
    } else {
      lp.phi = E / sqrt((1 + Up) / (1 - Up));
      if ((lp.phi = pj_phi2(pow(lp.phi, 1 / B), P.e)) == HUGE_VAL)
          i_error();
      lp.lam = - rB * atan2((Sp * cosgam - Vp * singam), cos(BrA * u));
    }
  }
}
