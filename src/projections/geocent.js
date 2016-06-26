pj_add(pj_geocent, 'geocent', 'Geocentric', '\n\t');

function pj_geocent(P) {
  P.is_geocent = true;
  P.x0 = 0;
  P.y0 = 0;

  P.fwd = function (lp, xy) {
    xy.x = lp.lam;
    xy.y = lp.phi;
  };

  P.inv = function(xy, lp) {
    lp.phi = xy.y;
    lp.lam = xy.x;
  };
}
