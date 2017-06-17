
function pj_tsfn(phi, sinphi, e) {
	sinphi *= e;
  // Proj.4 returns HUGE_VAL on div0; this returns +/- Infinity; effect should be same
	return (tan(0.5 * (M_HALFPI - phi)) /
	  pow((1 - sinphi) / (1 + sinphi), 0.5 * e));
}
