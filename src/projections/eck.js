/* @requires aasincos */

pj_add(pj_eck1, 'eck1', 'Eckert I', '\n\tPCyl Sph');
pj_add(pj_eck2, 'eck2', 'Eckert II', '\n\tPCyl Sph');
pj_add(pj_eck3, 'eck3', 'Eckert III', '\n\tPCyl Sph');
pj_add(pj_wag6, 'wag6', 'Wagner VI', '\n\tPCyl Sph');
pj_add(pj_kav7, 'kav7', 'Kavraisky VII', '\n\tPCyl Sph');
pj_add(pj_putp1, 'putp1', 'Putnins P1', '\n\tPCyl Sph');
pj_add(pj_eck4, 'eck4', 'Eckert IV', '\n\tPCyl Sph');
pj_add(pj_eck5, 'eck5', 'Eckert V', '\n\tPCyl Sph');

function pj_eck1(P) {
  var FC = 0.92131773192356127802,
      RP = 0.31830988618379067154;
  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    xy.x = FC * lp.lam * (1 - RP * fabs(lp.phi));
    xy.y = FC * lp.phi;
  }

  function s_inv(xy, lp) {
    lp.phi = xy.y / FC;
    lp.lam = xy.x / (FC * (1 - RP * fabs(lp.phi)));
  }
}

function pj_eck2(P) {
  var FXC = 0.46065886596178063902,
      FYC = 1.44720250911653531871,
      C13 = 0.33333333333333333333,
      ONEEPS = 1.0000001;
  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    xy.x = FXC * lp.lam * (xy.y = sqrt(4 - 3 * sin(fabs(lp.phi))));
    xy.y = FYC * (2 - xy.y);
    if (lp.phi < 0) xy.y = -xy.y;
  }

  function s_inv(xy, lp) {
    lp.lam = xy.x / (FXC * (lp.phi = 2 - fabs(xy.y) / FYC));
    lp.phi = (4 - lp.phi * lp.phi) * C13;
    if (fabs(lp.phi) >= 1) {
      if (fabs(lp.phi) > ONEEPS) i_error();
      else
        lp.phi = lp.phi < 0 ? -M_HALFPI : M_HALFPI;
    } else
      lp.phi = asin(lp.phi);
    if (xy.y < 0)
      lp.phi = -lp.phi;
  }
}

function pj_eck3(P) {
  var Q = {
    C_x: 0.42223820031577120149,
    C_y: 0.84447640063154240298,
    A: 1,
    B: 0.4052847345693510857755
  };
  pj_eck3_init(P, Q);
}

function pj_kav7(P) {
  var Q = {
    C_x: 0.8660254037844,
    C_y: 1,
    A: 0,
    B: 0.30396355092701331433
  };
  pj_eck3_init(P, Q);
}

function pj_wag6(P) {
  var Q = {
    C_x: 0.94745,
    C_y: 0.94745,
    A: 0,
    B: 0.30396355092701331433
  };
  pj_eck3_init(P, Q);
}

function pj_putp1(P) {
  var Q = {
    C_x: 1.89490,
    C_y: 0.94745,
    A: -0.5,
    B: 0.30396355092701331433
  };
  pj_eck3_init(P, Q);
}

function pj_eck3_init(P, Q) {
  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    xy.y = Q.C_y * lp.phi;
    xy.x = Q.C_x * lp.lam * (Q.A + asqrt(1 - Q.B * lp.phi * lp.phi));
  }

  function s_inv(xy, lp) {
    lp.phi = xy.y / Q.C_y;
    lp.lam = xy.x / (Q.C_x * (Q.A + asqrt(1 - Q.B * lp.phi * lp.phi)));
  }
}

function pj_eck4(P) {
  var C_x = 0.42223820031577120149,
      C_y = 1.32650042817700232218,
      RC_y = 0.75386330736002178205,
      C_p = 3.57079632679489661922,
      RC_p = 0.28004957675577868795,
      EPS = 1e-7,
      NITER = 6;

  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    var p, V, s, c, i;
    p = C_p * sin(lp.phi);
    V = lp.phi * lp.phi;
    lp.phi *= 0.895168 + V * ( 0.0218849 + V * 0.00826809 );
    for (i = NITER; i; --i) {
      c = cos(lp.phi);
      s = sin(lp.phi);
      lp.phi -= V = (lp.phi + s * (c + 2) - p) /
          (1 + c * (c + 2) - s * s);
      if (fabs(V) < EPS)
        break;
    }
    if (!i) {
      xy.x = C_x * lp.lam;
      xy.y = lp.phi < 0 ? -C_y : C_y;
    } else {
      xy.x = C_x * lp.lam * (1 + cos(lp.phi));
      xy.y = C_y * sin(lp.phi);
    }
  }

  function s_inv(xy, lp) {
    var c;
    lp.phi = aasin(xy.y / C_y);
    lp.lam = xy.x / (C_x * (1 + (c = cos(lp.phi))));
    lp.phi = aasin((lp.phi + sin(lp.phi) * (c + 2)) / C_p);
  }
}

function pj_eck5(P) {
  var XF = 0.44101277172455148219,
      RXF = 2.26750802723822639137,
      YF = 0.88202554344910296438,
      RYF = 1.13375401361911319568;

  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    xy.x = XF * (1 + cos(lp.phi)) * lp.lam;
    xy.y = YF * lp.phi;
  }

  function s_inv(xy, lp) {
    lp.lam = RXF * xy.x / (1 + cos(lp.phi = RYF * xy.y));
  }
}
