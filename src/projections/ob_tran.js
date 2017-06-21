/* @requires aasincos */

pj_add(pj_ob_tran, 'ob_tran', 'General Oblique Transformation', "\n\tMisc Sph" +
  "\n\to_proj= plus parameters for projection" +
  "\n\to_lat_p= o_lon_p= (new pole) or" +
  "\n\to_alpha= o_lon_c= o_lat_c= or" +
  "\n\to_lon_1= o_lat_1= o_lon_2= o_lat_2=");

function pj_ob_tran(P) {
  var name, defn, P2;
  var lamp, cphip, sphip, phip;
  var lamc, phic, alpha;
  var lam1, lam2, phi1, phi2, con;
  var TOL = 1e-10;

  name = pj_param(P.params, 'so_proj');
  defn = pj_list[name];
  if (!name) e_error(-26);
  if (!defn || name == 'ob_tran') e_error(-37);
  P.es = 0;
  // copy params to second object
  P2 = {};
  Object.keys(P).forEach(function(key) {
    // TODO: remove o_ params?
    P2[key] = P[key];
  });
  defn.init(P2);

  // NOT in Proj.4
  // fix output units when doing latlong transform (see pj_transform.js)
  if (P2.is_latlong && P.to_meter == 1) {
    P.to_meter = DEG_TO_RAD;
    P.fr_meter = RAD_TO_DEG;
  }

  if (pj_param(P.params, "to_alpha")) {
    lamc  = pj_param(P.params, "ro_lon_c");
    phic  = pj_param(P.params, "ro_lat_c");
    alpha = pj_param(P.params, "ro_alpha");

    if (fabs(fabs(phic) - M_HALFPI) <= TOL) e_error(-32);
    lamp = lamc + aatan2(-cos(alpha), -sin(alpha) * sin(phic));
    phip = aasin(cos(phic) * sin(alpha));

  } else if (pj_param(P.params, "to_lat_p")) { /* specified new pole */
    lamp = pj_param(P.params, "ro_lon_p");
    phip = pj_param(P.params, "ro_lat_p");

  } else { /* specified new "equator" points */

    lam1 = pj_param(P.params, "ro_lon_1");
    phi1 = pj_param(P.params, "ro_lat_1");
    lam2 = pj_param(P.params, "ro_lon_2");
    phi2 = pj_param(P.params, "ro_lat_2");
    if (fabs(phi1 - phi2) <= TOL ||
        (con = fabs(phi1)) <= TOL ||
        fabs(con - M_HALFPI) <= TOL ||
        fabs(fabs(phi2) - M_HALFPI) <= TOL) e_error(-33);
    lamp = atan2(cos(phi1) * sin(phi2) * cos(lam1) -
        sin(phi1) * cos(phi2) * cos(lam2),
        sin(phi1) * cos(phi2) * sin(lam2) -
        cos(phi1) * sin(phi2) * sin(lam1));
    phip = atan(-cos(lamp - lam1) / tan(phi1));
  }
  if (fabs(phip) > TOL) { /* oblique */
    cphip = cos(phip);
    sphip = sin(phip);
    P.fwd = o_fwd;
    P.inv = P2.inv ? o_inv : null;
  } else { /* transverse */
    P.fwd = t_fwd;
    P.inv = P2.inv ? t_inv : null;
  }

  function o_fwd(lp, xy) {
    var coslam, sinphi, cosphi;
    coslam = cos(lp.lam);
    sinphi = sin(lp.phi);
    cosphi = cos(lp.phi);
    lp.lam = adjlon(aatan2(cosphi * sin(lp.lam), sphip * cosphi * coslam +
        cphip * sinphi) + lamp);
    lp.phi = aasin(sphip * sinphi - cphip * cosphi * coslam);
    P2.fwd(lp, xy);
  }

  function t_fwd(lp, xy) {
    var cosphi, coslam;
    cosphi = cos(lp.phi);
    coslam = cos(lp.lam);
    lp.lam = adjlon(aatan2(cosphi * sin(lp.lam), sin(lp.phi)) + lamp);
    lp.phi = aasin(-cosphi * coslam);
    P2.fwd(lp, xy);
  }

  function o_inv(xy, lp) {
    var coslam, sinphi, cosphi;
    P2.inv(xy, lp);
    if (lp.lam != HUGE_VAL) {
      coslam = cos(lp.lam -= lamp);
      sinphi = sin(lp.phi);
      cosphi = cos(lp.phi);
      lp.phi = aasin(sphip * sinphi + cphip * cosphi * coslam);
      lp.lam = aatan2(cosphi * sin(lp.lam), sphip * cosphi * coslam -
        cphip * sinphi);
    }
  }

  function t_inv(xy, lp) {
    var cosphi, t;
    P2.inv(xy, lp);
    if (lp.lam != HUGE_VAL) {
      cosphi = cos(lp.phi);
      t = lp.lam - lamp;
      lp.lam = aatan2(cosphi * sin(t), - sin(lp.phi));
      lp.phi = aasin(cosphi * cos(t));
    }
  }
}
