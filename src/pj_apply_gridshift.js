/* @requires nad_cvt */

// This implementation takes uses the gridlist from a coordinate
// system definition.  If the gridlist has not yet been
// populated in the coordinate system definition we set it up now.
function pj_apply_gridshift_2(defn, inverse, xx, yy, zz) {
  fatal("grishift not implemented");
}

// public API function of Proj.4
function pj_apply_gridshift(tables, inverse, xx, yy, zz) {}

function pj_apply_gridshift_3(tables, inverse, xx, yy, zz) {}
