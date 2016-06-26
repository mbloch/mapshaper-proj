pj_add(pj_lonlat, 'lonlat', 'Lat/long (Geodetic)', '\n\t');
pj_add(pj_lonlat, 'longlat', 'Lat/long (Geodetic alias)', '\n\t');
pj_add(pj_latlon, 'latlon', 'Lat/long (Geodetic alias)', '\n\t');
pj_add(pj_latlon, 'latlong', 'Lat/long (Geodetic alias)', '\n\t');

function pj_lonlat(P) {
  pj_lonlat_init(P, false);
}

function pj_latlon(P) {
  pj_lonlat_init(P, true);
}

function pj_lonlat_init(P, swapped) {
  P.x0 = 0;
  P.y0 = 0;
  P.is_latlong = 1;
  if (swapped) {
    P.inv = fwd;
    P.fwd = inv;
  } else {
    P.inv = inv;
    P.fwd = fwd;
  }

  function fwd(lp, xy) {
    xy.x = lp.lam / P.a;
    xy.y = lp.phi / P.a;
  }

  function inv(xy, lp) {
    lp.lam = xy.x * P.a;
    lp.phi = xy.y * P.a;
  }
}
