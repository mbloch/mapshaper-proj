/* @requires
wkt2_parse
wkt2_epsg
wkt2_normalize
wkt2_make
wkt2_stringify
wkt_convert_projcs
wkt_convert_geogcs
pj_init
*/

// Public WKT2 <-> Proj4 entry points.
//
//   wkt2_to_proj4(str)        - parse WKT2 string, emit Proj4 string
//   wkt2_from_proj4(P, opts)  - take a Proj4 string or pj_init() struct,
//                               emit a WKT2:2019-flavoured string
//
// opts.pretty  (boolean): indent the output

function wkt2_to_proj4(str) {
  var tree = wkt2_parse(str);
  var normalized = wkt2_normalize(tree);
  if (normalized.PROJCS) {
    if (normalized.PROJCS._direct_proj4) {
      return wkt2_to_proj4_postprocess(normalized.PROJCS._direct_proj4,
                                       normalized.PROJCS);
    }
    return wkt_convert_projcs(normalized.PROJCS);
  }
  if (normalized.GEOGCS) {
    return '+proj=longlat ' + wkt_convert_geogcs(normalized.GEOGCS);
  }
  wkt_error('WKT2 to Proj4: unsupported CRS type');
}

function wkt2_to_proj4_postprocess(proj4, projcs) {
  var geogcs = projcs.GEOGCS;
  if (geogcs && geogcs.DATUM && geogcs.DATUM.TOWGS84 &&
      proj4.indexOf('+towgs84') === -1) {
    proj4 = proj4.replace(/\+no_defs$/, '+towgs84=' +
      geogcs.DATUM.TOWGS84.join(',') + ' +no_defs');
  }
  return proj4;
}

function wkt2_from_proj4(P, opts) {
  if (typeof P === 'string' || P instanceof String) {
    P = pj_init(String(P));
  }
  var tree = wkt2_make(P);
  return wkt2_stringify(tree, opts);
}
