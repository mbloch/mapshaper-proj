/* @requires
pj_const
pj_err
pj_param
pj_list
pj_utils
pj_init
pj_transform
pj_fwd
pj_inv
rtodms
proj4js_compat
wkt
*/

// Projections are inserted here by the build script

var api = proj4js; // (partial) support for proj4js api

// Add Proj.4-style api
api.pj_init = pj_init;
api.pj_fwd = pj_fwd;
api.pj_inv = pj_inv;
api.pj_transform = pj_transform;

// Convenience functions not in Proj.4
api.pj_fwd_deg = pj_fwd_deg;
api.pj_inv_deg = pj_inv_deg;
api.pj_transform_point = pj_transform_point;

// Export some functions for testing
api.internal = {
  dmstod: dmstod,
  dmstor: dmstor,
  get_rtodms: get_rtodms,
  get_dtodms: get_dtodms,
  get_proj_defn: get_proj_defn,
  pj_latlong_from_proj: pj_latlong_from_proj,
  pj_get_params: pj_get_params,
  pj_datums: pj_datums,
  pj_list: pj_list,
  pj_ellps: pj_ellps,
  pj_units: pj_units,
  pj_read_init_opts: pj_read_init_opts,
  find_datum: find_datum,
  DEG_TO_RAD: DEG_TO_RAD,
  RAD_TO_DEG: RAD_TO_DEG,
  wkt_parse: wkt_parse,
  wkt_unpack: wkt_unpack,
  wkt_to_proj4: wkt_to_proj4,
  wkt_from_proj4: wkt_from_proj4,
  wkt_make_projcs: wkt_make_projcs,
  wkt_get_geogcs_name: wkt_get_geogcs_name,
  wkt_stringify: wkt_stringify,
  mproj_insert_libcache: mproj_insert_libcache,
  mproj_search_libcache: mproj_search_libcache
};

if (typeof define == 'function' && define.amd) {
  define('mproj', api);
} else if (typeof exports == 'object') {
  module.exports = api;
} else {
  this.mproj = api;
}

// TODO: move to better file
function pj_latlong_from_proj(P) {
  var defn = '+proj=latlong' + get_geod_defn(P);
  return pj_init(defn);
}
