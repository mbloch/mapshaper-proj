/* @requires gn_sinu, moll */
pj_add(pj_goode, 'goode', "Goode Homolosine", "\n\tPCyl, Sph.");

function pj_goode(P) {
  var Y_COR = 0.05280,
      PHI_LIM = 0.71093078197902358062,
      sinuFwd, sinuInv, mollFwd, mollInv;
  P.es = 0;
  pj_sinu(P);
  sinuFwd = P.fwd;
  sinuInv = P.inv;
  pj_moll(P);
  mollFwd = P.fwd;
  mollInv = P.inv;
  P.fwd = function(lp, xy) {
    if (fabs(lp.phi) < PHI_LIM) {
      sinuFwd(lp, xy);
    } else {
      mollFwd(lp, xy);
      xy.y -= lp.phi > 0 ? Y_COR : -Y_COR;
    }
  };
  P.inv = function(xy, lp) {
    if (fabs(xy.y) <= PHI_LIM) {
      sinuInv(xy, lp);
    } else {
      xy.y += xy.y > 0 ? Y_COR : -Y_COR;
      mollInv(xy, lp);
    }
  };
}
