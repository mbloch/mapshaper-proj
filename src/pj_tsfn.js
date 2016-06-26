
function pj_tsfn(phi, sinphi, e) {
	sinphi *= e;
	return (tan(0.5 * (M_HALFPI - phi)) /
	  pow((1 - sinphi) / (1 + sinphi), 0.5 * e));
}
