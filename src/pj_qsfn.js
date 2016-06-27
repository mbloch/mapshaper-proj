function pj_qsfn(sinphi, e, one_es) {
  var EPS = 1e-7;
  var con;
  if (e >= EPS) {
    con = e * sinphi;
    return (one_es * (sinphi / (1 - con * con) -
       (0.5 / e) * log ((1 - con) / (1 + con))));
  } else
    return (sinphi + sinphi);
}
