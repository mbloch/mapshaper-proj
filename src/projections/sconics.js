pj_add(pj_get_sconic('EULER'), 'euler', 'Euler', '\n\tConic, Sph\n\tlat_1= and lat_2=');
pj_add(pj_get_sconic('MURD1'), 'murd1', 'Murdoch I', '\n\tConic, Sph\n\tlat_1= and lat_2=');
pj_add(pj_get_sconic('MURD2'), 'murd2', 'Murdoch II', '\n\tConic, Sph\n\tlat_1= and lat_2=');
pj_add(pj_get_sconic('MURD3'), 'murd3', 'Murdoch III', '\n\tConic, Sph\n\tlat_1= and lat_2=');
pj_add(pj_get_sconic('PCONIC'), 'pconic', 'Perspective Conic', '\n\tConic, Sph\n\tlat_1= and lat_2=');
pj_add(pj_get_sconic('TISSOT'), 'tissot', 'Tissot', '\n\tConic, Sph\n\tlat_1= and lat_2=');
pj_add(pj_get_sconic('VITK1'), 'vitk1', 'Vitkovsky I', '\n\tConic, Sph\n\tlat_1= and lat_2=');

function pj_get_sconic(type) {
  return function(P) {
    pj_sconic(P, type);
  };
}

function pj_sconic(P, type) {
  var del, cs;
  var p1, p2;
  var n;
  var rho_c;
  var rho_0;
  var sig;
  var c1, c2;
  var EPS = 1e-10;

  if (!pj_param(P.params, "tlat_1") || !pj_param(P.params, "tlat_2")) {
    e_error(-41);
  } else {
    p1 = pj_param(P.params, "rlat_1");
    p2 = pj_param(P.params, "rlat_2");
    del = 0.5 * (p2 - p1);
    sig = 0.5 * (p2 + p1);
    if (fabs(del) < EPS || fabs(sig) < EPS) {
      e_error(-42);
    }
  }

  switch (type) {
    case 'TISSOT':
      n = sin(sig);
      cs = cos(del);
      rho_c = n / cs + cs / n;
      rho_0 = sqrt((rho_c - 2 * sin(P.phi0)) / n);
      break;

    case 'MURD1':
      rho_c = sin(del) / (del * tan(sig)) + sig;
      rho_0 = rho_c - P.phi0;
      n = sin(sig);
      break;

    case 'MURD2':
      rho_c = (cs = sqrt(cos(del))) / tan(sig);
      rho_0 = rho_c + tan(sig - P.phi0);
      n = sin(sig) * cs;
      break;

    case 'MURD3':
      rho_c = del / (tan(sig) * tan(del)) + sig;
      rho_0 = rho_c - P.phi0;
      n = sin(sig) * sin(del) * tan(del) / (del * del);
      break;

    case 'EULER':
      n = sin(sig) * sin(del) / del;
      del *= 0.5;
      rho_c = del / (tan(del) * tan(sig)) + sig;
      rho_0 = rho_c - P.phi0;
      break;

    case 'PCONIC':
      n = sin(sig);
      c2 = cos(del);
      c1 = 1 / tan(sig);
      if (fabs(del = P.phi0 - sig) - EPS >= M_HALFPI)
        e_error(-43);
      rho_0 = c2 * (c1 - tan(del));
      break;

    case 'VITK1':
      n = (cs = tan(del)) * sin(sig) / del;
      rho_c = del / (cs * tan(sig)) + sig;
      rho_0 = rho_c - P.phi0;
      break;
  }

  P.inv = s_inv;
  P.fwd = s_fwd;
  P.es = 0;

  function s_fwd(lp, xy) {
    var rho;

    switch (type) {
      case 'MURD2':
        rho = rho_c + tan(sig - lp.phi);
        break;
      case 'PCONIC':
        rho = c2 * (c1 - tan(lp.phi - sig));
        break;
      default:
        rho = rho_c - lp.phi;
        break;
    }
    xy.x = rho * sin(lp.lam *= n);
    xy.y = rho_0 - rho * cos(lp.lam);
  }

  function s_inv(xy, lp) {
    var rho;

    rho = hypot(xy.x, xy.y = rho_0 - xy.y);
    if (n < 0) {
      rho = -rho;
      xy.x = -xy.x;
      xy.y = -xy.y;
    }

    lp.lam = atan2(xy.x, xy.y) / n;

    switch (type) {
      case 'PCONIC':
        lp.phi = atan(c1 - rho / c2) + sig;
        break;
      case 'MURD2':
        lp.phi = sig - atan(rho - rho_c);
        break;
      default:
        lp.phi = rho_c - rho;
    }
  }
}
