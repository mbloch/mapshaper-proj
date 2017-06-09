/* @requires aasincos */

pj_add(pj_putp2, 'putp2', 'Putnins P2', '\n\tPCyl., Sph.');

function pj_putp2(P) {
  var C_x = 1.89490,
      C_y = 1.71848,
      C_p = 0.6141848493043784,
      EPS = 1e-10,
      NITER = 10,
      PI_DIV_3 = 1.0471975511965977;
  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    var p, c, s, V, i;
    p = C_p * sin(lp.phi);
    s = lp.phi * lp.phi;
    lp.phi *= 0.615709 + s * ( 0.00909953 + s * 0.0046292 );
    for (i = NITER; i ; --i) {
      c = cos(lp.phi);
      s = sin(lp.phi);
      lp.phi -= V = (lp.phi + s * (c - 1) - p) /
        (1 + c * (c - 1) - s * s);
      if (fabs(V) < EPS)
        break;
    }
    if (!i)
      lp.phi = lp.phi < 0 ? - PI_DIV_3 : PI_DIV_3;
    xy.x = C_x * lp.lam * (cos(lp.phi) - 0.5);
    xy.y = C_y * sin(lp.phi);
  }

  function s_inv(xy, lp) {
    var c;
    lp.phi = aasin(xy.y / C_y);
    lp.lam = xy.x / (C_x * ((c = cos(lp.phi)) - 0.5));
    lp.phi = aasin((lp.phi + sin(lp.phi) * (c - 1)) / C_p);
  }
}
