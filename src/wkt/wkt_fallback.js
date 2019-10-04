
// Fallback WKT definitions include a Proj.4 string in an EXTENSION property.
// They should be readable by QGIS and gdal/ogr, but will not work
// with most other GIS software.

function get_fallback_wkt_maker(P) {
  // TODO: validate P?
  return make_fallback_wkt;
}

function make_fallback_wkt(P) {
  var projName = P.proj in pj_list ? pj_list[P.proj].name : '';
  var proj4 = get_proj_defn(P);
  var geogcs = wkt_make_geogcs(P);
  // GDAL seems to use "unnamed" all the time
  var name = projName ? geogcs.NAME + ' / ' + projName : 'unnamed';
  return {PROJCS: {
    NAME: name,
    GEOGCS: geogcs,
    PROJECTION: 'custom_proj4',
    PARAMETER: [],
    UNIT: wkt_make_unit(P),
    EXTENSION: ['PROJ4', proj4 + ' +wktext']
  }};
}

function get_fallback_wkt_parser(projcs) {
  var proj4 = get_proj4_from_extension(projcs);
  // TODO: try parsing proj4 string to validate?
  return proj4 ? get_proj4_from_extension : null;
}

function get_proj4_from_extension(projcs) {
  var ext = projcs.EXTENSION;
  if (ext && ext[0] == 'PROJ4') {
    return (ext[1] || '').replace(' +wktext', '');
  }
  return null;
}
