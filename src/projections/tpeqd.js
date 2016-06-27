/* @requires aasincos adjlon */
pj_add(pj_tpeqd, 'tpeqd', 'Two Point Equidistant', '\n\tMisc Sph\n\tlat_1= lon_1= lat_2= lon_2=');

function pj_tpeqd(P) {
  var cp1, sp1, cp2, sp2, ccs, cs, sc, r2z0, z02, dlam2;
  var hz0, thz0, rhshz0, ca, sa, lamp, lamc;
  var lam_1, lam_2, phi_1, phi_2, A12, pp;

  /* get control point locations */
  phi_1 = pj_param(P.params, "rlat_1");
  lam_1 = pj_param(P.params, "rlon_1");
  phi_2 = pj_param(P.params, "rlat_2");
  lam_2 = pj_param(P.params, "rlon_2");

  if (phi_1 == phi_2 && lam_1 == lam_2)
      e_error(-25);
  P.lam0  = adjlon(0.5 * (lam_1 + lam_2));
  dlam2 = adjlon(lam_2 - lam_1);
  cp1 = cos (phi_1);
  cp2 = cos (phi_2);
  sp1 = sin (phi_1);
  sp2 = sin (phi_2);
  cs = cp1 * sp2;
  sc = sp1 * cp2;
  ccs = cp1 * cp2 * sin(dlam2);
  z02 = aacos(sp1 * sp2 + cp1 * cp2 * cos(dlam2));
  hz0 = 0.5 * z02;
  A12 = atan2(cp2 * sin(dlam2),
    cp1 * sp2 - sp1 * cp2 * cos(dlam2));
  ca = cos(pp = aasin(cp1 * sin(A12)));
  sa = sin(pp);
  lamp = adjlon(atan2(cp1 * cos(A12), sp1) - hz0);
  dlam2 *= 0.5;
  lamc = M_HALFPI - atan2(sin(A12) * sp1, cos(A12)) - dlam2;
  thz0 = tan (hz0);
  rhshz0 = 0.5 / sin(hz0);
  r2z0 = 0.5 / z02;
  z02 *= z02;

  P.fwd = s_fwd;
  P.inv = s_inv;
  P.es = 0;

  function s_fwd(lp, xy) {
    var t, z1, z2, dl1, dl2, sp, cp;
    sp = sin(lp.phi);
    cp = cos(lp.phi);
    z1 = aacos(sp1 * sp + cp1 * cp * cos (dl1 = lp.lam + dlam2));
    z2 = aacos(sp2 * sp + cp2 * cp * cos (dl2 = lp.lam - dlam2));
    z1 *= z1;
    z2 *= z2;
    xy.x = r2z0 * (t = z1 - z2);
    t = z02 - t;
    xy.y = r2z0 * asqrt (4 * z02 * z2 - t * t);
    if ((ccs * sp - cp * (cs * sin(dl1) - sc * sin(dl2))) < 0)
      xy.y = -xy.y;
  }

  function s_inv(xy, lp) {
    var cz1, cz2, s, d, cp, sp;
    cz1 = cos(hypot(xy.y, xy.x + hz0));
    cz2 = cos(hypot(xy.y, xy.x - hz0));
    s = cz1 + cz2;
    d = cz1 - cz2;
    lp.lam = - atan2(d, (s * thz0));
    lp.phi = aacos(hypot(thz0 * s, d) * rhshz0);
    if ( xy.y < 0 )
      lp.phi = - lp.phi;
    /* lam--phi now in system relative to P1--P2 base equator */
    sp = sin(lp.phi);
    cp = cos(lp.phi);
    lp.phi = aasin(sa * sp + ca * cp * (s = cos(lp.lam -= lamp)));
    lp.lam = atan2(cp * sin(lp.lam), sa * cp * s - ca * sp) + lamc;
  }
}
