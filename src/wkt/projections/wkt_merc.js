/* @requires wkt_add */

// Mercator_2SP references:
//    http://geotiff.maptools.org/proj_list/mercator_2sp.html
//    http://www.remotesensing.org/geotiff/proj_list/mercator_2sp.html
//    https://trac.osgeo.org/gdal/ticket/4861

add_wkt_parser(get_simple_parser_test('Mercator_2SP,Mercator_1SP,Mercator,Mercator_Auxiliary_Sphere'),
  wkt_projcs_converter({
    GEOGCS: wkt_convert_merc_geogcs,
    PROJECTION: wkt_simple_projection_converter('merc'),
    PARAMETER: wkt_convert_merc_params
  }));

add_wkt_maker(get_simple_maker_test('merc'),
  wkt_projcs_maker({
    GEOGCS: wkt_make_merc_geogcs,
    PROJECTION: wkt_make_merc_projection,
    PARAMETER: wkt_make_merc_params,
    NAME: wkt_make_merc_name
  }));

function wkt_make_merc_name(P) {
  return wkt_proj4_is_webmercator(P) ? 'WGS 84 / Pseudo-Mercator' : null;
}

function wkt_make_merc_geogcs(P) {
  // PROBLEM: no clear way to get geographic cs from proj4 string
  // ... so assuming WGS 84 (consider using spherical datum instead)
  if (wkt_proj4_is_webmercator(P)) {
    return wkt_make_geogcs(pj_init('+proj=longlat +datum=WGS84'));
  }
  return null;
}

function wkt_convert_merc_geogcs(projcs) {
  var opts = wkt_projcs_is_webmercator(projcs) ? {aux_sphere: true} : null;
  return wkt_convert_geogcs(projcs.GEOGCS, opts);
}

function wkt_make_merc_projection(P) {
  return wkt_proj4_is_merc_2sp(P) ? 'Mercator_2SP' : 'Mercator_1SP';
}

function wkt_convert_merc_params(projcs) {
  // TODO: handle (esri) standard_parallel_1 in 1sp version
  // 1sp version accepts latitude_of_origin (ogc) or standard_parallel_1 (esri)
  // var rules = wkt_projcs_is_merc_2sp(projcs) ? 'lat_ts,lat_0b' : 'lat_tsb,lat_ts';
  var rules = wkt_projcs_is_merc_2sp(projcs) ? 'lat_ts,lat_0b' : 'lat_tsb,lat_ts';
  return wkt_parameter_converter(rules)(projcs);
}

function wkt_make_merc_params(P) {
  var rules = wkt_proj4_is_merc_2sp(P) ? 'lat_ts,lat_0b' : 'lat_tsb';
  return wkt_parameter_maker(rules)(P);
}

function wkt_projcs_is_merc_2sp(projcs) {
  var param = wkt_find_parameter_by_name(projcs, 'standard_parallel_1');
  return param && param[1] != 0;
}

function wkt_proj4_is_merc_2sp(P) {
  return pj_param(P.params, 'tlat_ts') && pj_param(P.params, 'dlat_ts') != 0;
}

function wkt_projcs_is_webmercator(projcs) {
  return /(Web_Mercator|Pseudo_Mercator)/i.test(wkt_name_to_slug(projcs.NAME));
}

// TODO: support other spheroids (web mercator may be used for other planets)
function wkt_proj4_is_webmercator(P) {
  return P.es === 0 && P.a == 6378137;
}
