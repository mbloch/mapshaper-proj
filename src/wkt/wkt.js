/* @requires
wkt_convert_projcs
wkt_make_projcs
wkt_convert_geogcs
wkt_make_geogcs
wkt_utm
wkt_merc
wkt_lcc
wkt_omerc
wkt_stere
wkt_vandg
wkt_simple_projections
wkt_stringify
wkt_parse
pj_init
*/

var WKT_OMIT_DEFAULTS = true;

function wkt_from_proj4(P) {
  var obj;
  if (P.length) P = pj_init(P); // convert proj4 string
  if (pj_is_latlong(P)) {
    obj = {GEOGCS: wkt_make_geogcs(P)};
  } else {
    obj = wkt_make_projcs(P);
  }
  return wkt_stringify(obj);
}

// @str A WKT CRS definition string (e.g. contents of a .prj file)
function wkt_to_proj4(str) {
  var o = wkt_parse(str);
  var proj4;

  if (o.PROJCS) {
    proj4 = wkt_convert_projcs(o.PROJCS);

  } else if (o.GEOGCS) {
    proj4 = '+proj=longlat ' + wkt_convert_geogcs(o.GEOGCS);

  } else if (o.GEOCCS) {
    wkt_error('geocentric coordinates are not supported');

  } else {
    wkt_error('missing a supported WKT CS type');
  }
  return proj4;
}

