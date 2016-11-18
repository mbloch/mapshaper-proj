pj_add(pj_lonlat, 'lonlat', 'Lat/long (Geodetic)', '\n\t');
pj_add(pj_lonlat, 'longlat', 'Lat/long (Geodetic alias)', '\n\t');
pj_add(pj_lonlat, 'latlon', 'Lat/long (Geodetic alias)', '\n\t');
pj_add(pj_lonlat, 'latlong', 'Lat/long (Geodetic alias)', '\n\t');

function pj_lonlat(P) {
  P.x0 = 0;
  P.y0 = 0;
  P.is_latlong = true;

  P.fwd = function(lp, xy) {
    xy.x = lp.lam / P.a;
    xy.y = lp.phi / P.a;
  };

  P.inv = function(xy, lp) {
    lp.lam = xy.x * P.a;
    lp.phi = xy.y * P.a;
  };
}
