/* @requires aasincos */

pj_add(pj_urmfps, 'urmfps', 'Urmaev Flat-Polar Sinusoidal', '\n\tPCyl, Sph.\n\tn=');
pj_add(pj_wag1, 'wag1', 'Wagner I (Kavraisky VI)', '\n\tPCyl, Sph.');


function pj_wag1(P) {
  pj_urmfps_init(P, 0.8660254037844386467637231707);
}

function pj_urmfps(P) {
  var n = pj_param(P.params, "dn");
  if (n <= 0 || n > 1) e_error(-40);
  pj_urmfps_init(P, n);
}

function pj_urmfps_init(P, n) {
  var C_x = 0.8773826753,
      C_y = 1.139753528477 / n;

  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    var phi = aasin(n * sin(lp.phi));
    xy.x = C_x * lp.lam * cos(phi);
    xy.y = C_y * phi;
  }

  function s_inv(xy, lp) {
    xy.y /= C_y;
    lp.phi = aasin(sin(xy.y) / n);
    lp.lam = xy.x / (C_x * cos(xy.y));
  }
}
