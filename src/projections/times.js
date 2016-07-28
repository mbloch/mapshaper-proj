pj_add(pj_times, 'times', 'Times', "\n\tCyl, Sph");

function pj_times(P) {
  P.es = 0;
  P.fwd = function(lp, xy) {
    var t = tan(lp.phi / 2);
    var s = sin(M_FORTPI * t);
    xy.x = lp.lam * (0.74482 - 0.34588 * s * s);
    xy.y = 1.70711 *  t;
  };
  P.inv = function (xy, lp) {
    var t = xy.y / 1.70711;
    var s = sin(M_FORTPI * t);
    lp.lam = xy.x / (0.74482 - 0.34588 * s * s);
    lp.phi = 2 * atan(t);
  };
}
