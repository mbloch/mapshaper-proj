
function pj_authset(es) {
  var P00 = 0.33333333333333333333 /*   1 /     3 */,
      P01 = 0.17222222222222222222 /*  31 /   180 */,
      P02 = 0.10257936507936507937 /* 517 /  5040 */,
      P10 = 0.06388888888888888888 /*  23 /   360 */,
      P11 = 0.06640211640211640212 /* 251 /  3780 */,
      P20 = 0.01677689594356261023 /* 761 / 45360 */,
      APA = [];
  var t;

  APA[0] = es * P00;
  t = es * es;
  APA[0] += t * P01;
  APA[1] = t * P10;
  t *= es;
  APA[0] += t * P02;
  APA[1] += t * P11;
  APA[2] = t * P20;
  return APA;
}

function pj_authlat(beta, APA) {
  var t = beta + beta;
  return(beta + APA[0] * sin(t) + APA[1] * sin(t+t) + APA[2] * sin(t+t+t));
}
