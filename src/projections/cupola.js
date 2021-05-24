pj_add(pj_cupola, 'cupola', 'Cupola', 'PCyl., Sph., NoInv.');

// Source: https://www.tandfonline.com/eprint/EE7Y8RK4GXA4ITWUTQPY/full?target=10.1080/23729333.2020.1862962
// See also: http://www.at-a-lanta.nl/weia/cupola.html

function pj_cupola(P) {
  var de = 0.5253;  // part of the equator on intermediate sphere, default = 1
  var dp = 0.7264;  // sin of angle of polar line, default = 1
  var ri = 1 / Math.sqrt(de * dp);
  var he = 0.4188; // height of equator (can be negative, default = 0)
  var se = 0.9701; // stretch in plane, default = 1
  var phi0 = 22 * DEG_TO_RAD; // phi of projection center
  // center of projection on intermediate sphere
  var pc = calcP(phi0);
  var qc = calcQ(0);
  var spc = sin(pc);
  var cpc = cos(pc);

  // apply default central meridian
  if (!pj_param(P.params, 'tlon_0')) {
    P.lam0 = 11.023 * DEG_TO_RAD;
  }

  P.es = 0;
  P.fwd = s_fwd;

  function calcP(phi) {
    return asin(dp * sin(phi) + he * sqrt(de * dp));
  }

  function calcQ(lam) {
    return de * lam;
  }

  function s_fwd(lp, xy) {
    var p = calcP(lp.phi);
    var q = calcQ(lp.lam);
    var sp = sin(p);
    var cp = cos(p);
    var sqqc = sin(q - qc);
    var cqqc = cos(q - qc);
    var K = sqrt(2 / (1 + sin(pc) * sp + cpc * cp * cqqc));
    xy.x = ri * K * cp * sqqc * se;
    xy.y = ri * K * (cpc * sp - spc * cp * cqqc) / se;
  }
}
