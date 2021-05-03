pj_add(pj_cupola, 'cupola', 'Cupola', '\n\tMisc., Sph., NoInv.');

// Source: https://github.com/OSGeo/PROJ/issues/2706
// See also: http://www.at-a-lanta.nl/weia/cupola.html

function pj_cupola(P) {
  // parameters for Cupola
  var c1 = 0.5253;  // part of the equator on intermediate sphere, default = 1
  var c2 = 0.7264;  // sin of angle of polarline; default = 1
  var c3 = 0.4188;  // height of the equator, can be negative, default = 0
  var c4 = 22.00;   // phi of centre projection in degrees, default = 0
  var c5 = 0.9701;  // stretch in plane, default = 1
  var c6 = 11.023;  // central meridian 11.023 degrees, also defines border of the map
  var c7 = 180.00;  // degrees to the right of c6, default = 180
  var r2 = 1.61885660611815;
  var w123 = 0.258701109423297;
  var c4r = 0.383972435438752;
  var pc = 0.559562341761853;
  var spc = sin(pc);
  var cpc = cos(pc);
  var c6r = DEG_TO_RAD * (c6-c7+180);  // c6 in [rad], v of center of projection
  var qc = c1*c6r;

  P.es = 0;
  P.fwd = s_fwd;

  function s_fwd(lp, xy) {
    // p, q: radians on intermediate sphere
    var p = asin(c2 * sin(lp.phi) + w123);
    var sp = sin(p);
    var cp = cos(p);
    var q = c1 * lp.lam;
    var sqqc = sin(q-qc);
    var cqqc = cos(q-qc);
    // k is Snyder's constant, taken as product with r2:
    var r2k = r2 * sqrt(2/(1+spc*sp+cpc*cp*cqqc));
    xy.x = r2k*cp*sqqc*c5;
    xy.y = r2k*(cpc*sp-spc*cp*cqqc)/c5;
  }
}
