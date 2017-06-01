/* @require wkt_common wkt_convert_projcs */

function add_simple_wkt_parser(projId, wktProjections, params) {
  var is_match = get_simple_parser_test(wktProjections);
  var convert = wkt_simple_projcs_converter(projId, params);
  add_wkt_parser(is_match, convert);
}

function add_simple_wkt_maker(projId, wktProjection, params) {
  var is_match = get_simple_maker_test(projId);
  var make = wkt_simple_projcs_maker(wktProjection, params);
  // add_wkt_maker(is_match, wkt_make_projcs);
  add_wkt_maker(is_match, make);
}

function get_simple_parser_test(wktNames) {
  var slugs = wkt_split_names(wktNames).map(wkt_name_to_slug);
  return function(obj) {
    var wktName = obj.PROJECTION[0]; // TODO: handle unexected structure
    return slugs.indexOf(wkt_name_to_slug(wktName)) > -1;
  };
}

function get_simple_maker_test(projId) {
  return function(P) {
    var id = get_proj_id(P);
    return id && id == projId;
  };
}

function add_wkt_parser(is_match, parse) {
  if (typeof is_match != 'function') wkt_error("Missing WKT parser test");
  if (typeof parse != 'function') wkt_error("Missing WKT parse function");
  wkt_parsers.push([is_match, parse]);
}

function add_wkt_maker(is_match, make) {
  if (typeof is_match != 'function') wkt_error("Missing WKT maker test");
  if (typeof make != 'function') wkt_error("Missing WKT maker function");
  wkt_makers.push([is_match, make]);
}
