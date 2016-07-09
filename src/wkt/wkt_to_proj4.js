/* @requires
wkt_err
wkt_projection
wkt_datum
wkt_param
wkt_unit
wkt_parse
*/

var WKT_OMIT_DEFAULTS = true;

// @str A WKT CRS definition string (e.g. contents of a .prj file)
function wkt_to_proj4(str) {
  var o = wkt_parse(str);
  var proj4;

  if (o.PROJCS) {
    proj4 = wkt_convert_projection(o.PROJCS);

  } else if (o.GEOGCS) {
    proj4 = '+proj=longlat ' + wkt_convert_geogcs(o.GEOGCS);

  } else if (o.GEOCCS) {
    wkt_error('geocentric coordinates are not supported');

  } else {
    wkt_error('missing a supported WKT CS type');
  }
  return proj4;
}

function wkt_convert_projection(obj) {
  var projDefn = wkt_get_proj(obj.PROJECTION);
  var wktName = obj.NAME.replace(/ /g, '_');
  var unitDefn, i, match, projStr, geogStr, paramStr;

  // TODO: implement separate ogc vertical units param
  unitDefn = wkt_get_unit(obj.UNIT);

  if (!projDefn) {
    wkt_error('unknown projection: ' + obj.PROJECTION);
  }
  if (!projDefn.proj) {
    wkt_error('projection not implemented: ' + obj.PROJECTION);
  }

  // handle several special cases by matching PROJCS wkt name
  if (match = /UPS_(North|South)/i.exec(wktName)) {
    projStr = '+proj=ups';
    if (match[1].toLowerCase() == 'south') {
      projStr += ' +south';
    }
  } else if (match = /UTM_zone_([1-9]{1,2})(N|S)/i.exec(wktName)) {
    projStr = '+proj=utm +zone=' + match[1];
    if (match[2] == 'S') {
      projStr += ' +south';
    }
  } else if (/(Web_Mercator|Pseudo-Mercator)/i.test(wktName)) {
    // kludge for web mercator
    projStr = '+proj=merc';
    geogStr = wkt_convert_geogcs(obj.GEOGCS, {aux_sphere: true});
  } else {
    projStr = '+proj=' + projDefn.proj;
    paramStr = wkt_convert_params(obj.PARAMETER || [], projDefn, unitDefn);
    if (paramStr) projStr += ' ' + paramStr;
  }

  if (!geogStr) {
    geogStr = wkt_convert_geogcs(obj.GEOGCS);
  }

  // special cases
  if (projDefn.proj == 'vandg') {
    // adding R_A param to match ogr2ogr and epsg (source: https://epsg.io/54029)
    geogStr += ' +R_A';
  }

  projStr += ' ' + geogStr;

  if (unitDefn.to_meter != 1) {
    projStr += ' +to_meter=' + unitDefn.to_meter;
  } else if (!WKT_OMIT_DEFAULTS) {
    projStr += ' +units=m';
  }

  return projStr + ' +no_defs';
}
