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
//   projjson_to_proj4(json)   - parse PROJJSON string/object, emit Proj4
//   projjson_from_proj4(P)    - Proj4 string/pj_init() -> PROJJSON
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

// --- PROJJSON bridge --------------------------------------------------------
//
// Implemented as:
//   PROJJSON -> WKT2 tree -> WKT2 string -> Proj4
//   Proj4 -> WKT2 string -> WKT2 tree -> PROJJSON

function projjson_to_proj4(json) {
  var obj = typeof json === 'string' || json instanceof String ?
    JSON.parse(String(json)) : json;
  var tree = projjson_to_wkt2_tree(obj);
  var wkt = wkt2_stringify(tree);
  return wkt2_to_proj4(wkt);
}

function projjson_from_proj4(P, opts) {
  var wkt = wkt2_from_proj4(P);
  var tree = wkt2_parse(wkt);
  var obj = wkt2_tree_to_projjson(tree);
  if (opts && opts.as_object) return obj;
  return JSON.stringify(obj, null, opts && opts.pretty ? 2 : 0);
}

function projjson_to_wkt2_tree(obj) {
  if (!obj || typeof obj !== 'object') {
    wkt_error('projjson_to_proj4: missing or invalid PROJJSON object');
  }
  var type = obj.type || '';
  if (type === 'GeographicCRS' || type === 'GeodeticCRS') {
    return projjson_make_geogcrs(obj, 'GEOGCRS', true);
  }
  if (type === 'ProjectedCRS') {
    return projjson_make_projcrs(obj);
  }
  if (type === 'BoundCRS') {
    return projjson_make_boundcrs(obj);
  }
  wkt_error('projjson_to_proj4: unsupported PROJJSON type: ' + type);
}

function projjson_make_projcrs(obj) {
  var name = obj.name || 'Unknown';
  var base = projjson_make_geogcrs(obj.base_crs || {}, 'BASEGEOGCRS', false);
  var conv = projjson_make_conversion(obj.conversion || {});
  var cs = obj.coordinate_system || {};
  var unit = projjson_get_length_unit(cs) || ['LENGTHUNIT', 'metre', 1];
  var node = ['PROJCRS', name, base, conv];
  node.push(['CS', 'Cartesian', 2]);
  node.push(projjson_make_axis_from_cs(cs, 0, '(E)', 'east', unit));
  node.push(projjson_make_axis_from_cs(cs, 1, '(N)', 'north', unit));
  var id = projjson_make_id_node(obj.id);
  if (id) node.push(id);
  return node;
}

function projjson_make_boundcrs(obj) {
  var source = projjson_to_wkt2_tree(obj.source_crs || {});
  var target = projjson_to_wkt2_tree(obj.target_crs || {});
  var tr = projjson_make_transformation(obj.transformation || {});
  return ['BOUNDCRS', ['SOURCECRS', source], ['TARGETCRS', target], tr];
}

function projjson_make_transformation(obj) {
  var name = obj.name || 'Transformation';
  var out = ['ABRIDGEDTRANSFORMATION', name];
  var method = obj.method || {};
  out.push(projjson_make_method_node(method));
  (obj.parameters || []).forEach(function(p) {
    out.push(projjson_make_parameter_node(p));
  });
  return out;
}

function projjson_make_geogcrs(obj, keyword, includeCs) {
  var name = obj.name || 'Unknown';
  var datumNode = projjson_make_datum_node(obj);
  var pmNode = projjson_make_prime_meridian(obj.prime_meridian);
  var node = [keyword || 'GEOGCRS', name, datumNode, pmNode];
  if (includeCs) {
    var cs = obj.coordinate_system || {};
    var angleUnit = projjson_get_angle_unit(cs) || ['ANGLEUNIT', 'degree', 0.0174532925199433];
    node.push(['CS', 'ellipsoidal', 2]);
    node.push(projjson_make_axis_from_cs(cs, 0, 'geodetic latitude (Lat)', 'north', angleUnit));
    node.push(projjson_make_axis_from_cs(cs, 1, 'geodetic longitude (Lon)', 'east', angleUnit));
  }
  var id = projjson_make_id_node(obj.id);
  if (id) node.push(id);
  return node;
}

function projjson_make_datum_node(obj) {
  var ensemble = obj.datum_ensemble || obj.datumEnsemble;
  var datum = obj.datum;
  if (ensemble) {
    var ens = ['ENSEMBLE', ensemble.name || 'Unknown ensemble'];
    (ensemble.members || []).forEach(function(m) {
      ens.push(['MEMBER', m.name || 'Unknown']);
    });
    ens.push(projjson_make_ellipsoid_node(ensemble.ellipsoid || {}));
    if (ensemble.accuracy != null) {
      ens.push(['ENSEMBLEACCURACY', parseFloat(ensemble.accuracy)]);
    }
    var eid = projjson_make_id_node(ensemble.id);
    if (eid) ens.push(eid);
    return ens;
  }
  if (datum) {
    var node = ['DATUM', datum.name || 'Unknown', projjson_make_ellipsoid_node(datum.ellipsoid || {})];
    var did = projjson_make_id_node(datum.id);
    if (did) node.push(did);
    return node;
  }
  return ['DATUM', 'Unknown', projjson_make_ellipsoid_node({name: 'WGS 84', semi_major_axis: 6378137, inverse_flattening: 298.257223563})];
}

function projjson_make_ellipsoid_node(ellipsoid) {
  var name = ellipsoid.name || 'Unknown';
  var a = ellipsoid.semi_major_axis != null ? ellipsoid.semi_major_axis : 6378137;
  var rf = ellipsoid.inverse_flattening != null ? ellipsoid.inverse_flattening : 298.257223563;
  var unit = projjson_unit_to_wkt2(ellipsoid.unit, 'length') || ['LENGTHUNIT', 'metre', 1];
  var node = ['ELLIPSOID', name, a, rf, unit];
  var id = projjson_make_id_node(ellipsoid.id);
  if (id) node.push(id);
  return node;
}

function projjson_make_prime_meridian(pm) {
  pm = pm || {name: 'Greenwich', longitude: 0};
  var unit = projjson_unit_to_wkt2(pm.unit, 'angle') || ['ANGLEUNIT', 'degree', 0.0174532925199433];
  var node = ['PRIMEM', pm.name || 'Greenwich', pm.longitude == null ? 0 : pm.longitude, unit];
  var id = projjson_make_id_node(pm.id);
  if (id) node.push(id);
  return node;
}

function projjson_make_conversion(conv) {
  var name = conv.name || 'Unknown conversion';
  var out = ['CONVERSION', name];
  out.push(projjson_make_method_node(conv.method || {}));
  (conv.parameters || []).forEach(function(p) {
    out.push(projjson_make_parameter_node(p));
  });
  return out;
}

function projjson_make_method_node(method) {
  var out = ['METHOD', method.name || 'Unknown method'];
  var id = projjson_make_id_node(method.id);
  if (id) out.push(id);
  return out;
}

function projjson_make_parameter_node(param) {
  var unitKind = 'scale';
  if (param.unit && typeof param.unit === 'object') {
    if (param.unit.type === 'AngularUnit') unitKind = 'angle';
    else if (param.unit.type === 'LinearUnit') unitKind = 'length';
    else if (param.unit.type === 'ScaleUnit') unitKind = 'scale';
  } else {
    // If the unit is omitted, default to scale unit; this keeps output valid.
    unitKind = 'scale';
  }
  var unit = projjson_unit_to_wkt2(param.unit, unitKind);
  var out = ['PARAMETER', param.name || 'Unknown parameter', param.value == null ? 0 : param.value,
             unit || ['SCALEUNIT', 'unity', 1]];
  var id = projjson_make_id_node(param.id);
  if (id) out.push(id);
  return out;
}

function projjson_make_axis_from_cs(cs, idx, fallbackName, fallbackDir, fallbackUnit) {
  var axisList = cs.axis || cs.axes || [];
  var axis = axisList[idx] || {};
  var name = axis.name || fallbackName;
  var dir = axis.direction || fallbackDir;
  var unit = projjson_unit_to_wkt2(axis.unit, projjson_axis_unit_kind(fallbackUnit)) || fallbackUnit;
  return ['AXIS', name, dir, ['ORDER', idx + 1], unit];
}

function projjson_axis_unit_kind(unitNode) {
  if (!unitNode || !Array.isArray(unitNode)) return 'length';
  if (unitNode[0] === 'ANGLEUNIT') return 'angle';
  if (unitNode[0] === 'SCALEUNIT') return 'scale';
  return 'length';
}

function projjson_get_angle_unit(cs) {
  var axisList = cs.axis || cs.axes || [];
  for (var i = 0; i < axisList.length; i++) {
    var unit = projjson_unit_to_wkt2(axisList[i].unit, 'angle');
    if (unit && unit[0] === 'ANGLEUNIT') return unit;
  }
  return null;
}

function projjson_get_length_unit(cs) {
  var axisList = cs.axis || cs.axes || [];
  for (var i = 0; i < axisList.length; i++) {
    var unit = projjson_unit_to_wkt2(axisList[i].unit, 'length');
    if (unit && unit[0] === 'LENGTHUNIT') return unit;
  }
  return null;
}

function projjson_make_id_node(id) {
  if (!id || !id.authority || id.code == null) return null;
  return ['ID', id.authority, id.code];
}

function projjson_unit_to_wkt2(unit, kind) {
  var kw = kind === 'angle' ? 'ANGLEUNIT' : kind === 'scale' ? 'SCALEUNIT' : 'LENGTHUNIT';
  if (!unit) {
    if (kind === 'angle') return ['ANGLEUNIT', 'degree', 0.0174532925199433];
    if (kind === 'scale') return ['SCALEUNIT', 'unity', 1];
    return ['LENGTHUNIT', 'metre', 1];
  }
  if (typeof unit === 'string') {
    if (/^degree$/i.test(unit)) return ['ANGLEUNIT', 'degree', 0.0174532925199433];
    if (/^met(er|re)$/i.test(unit)) return ['LENGTHUNIT', 'metre', 1];
    if (/^unity$/i.test(unit)) return ['SCALEUNIT', 'unity', 1];
    return [kw, unit, 1];
  }
  return [kw, unit.name || unit.abbreviation || (kind === 'length' ? 'metre' : kind === 'angle' ? 'degree' : 'unity'),
          unit.conversion_factor == null ? 1 : unit.conversion_factor];
}

function wkt2_tree_to_projjson(node) {
  var out = wkt2_node_to_projjson(node);
  out.$schema = 'https://proj.org/schemas/v0.7/projjson.schema.json';
  return out;
}

function wkt2_node_to_projjson(node) {
  if (!Array.isArray(node)) wkt_error('projjson_from_proj4: invalid WKT2 tree');
  switch (node[0]) {
    case 'PROJCRS':
      return wkt2_projcrs_to_projjson(node);
    case 'GEOGCRS':
    case 'GEODCRS':
    case 'GEOGRAPHICCRS':
    case 'GEODETICCRS':
    case 'BASEGEOGCRS':
    case 'BASEGEODCRS':
      return wkt2_geogcrs_to_projjson(node);
    case 'BOUNDCRS':
      return wkt2_boundcrs_to_projjson(node);
    default:
      wkt_error('projjson_from_proj4: unsupported WKT2 root: ' + node[0]);
  }
}

function wkt2_projcrs_to_projjson(node) {
  var out = {
    type: 'ProjectedCRS',
    name: wkt2_name_of(node) || 'Unknown',
    base_crs: wkt2_geogcrs_to_projjson(wkt2_find(node, 'BASEGEOGCRS') || wkt2_find(node, 'BASEGEODCRS')),
    conversion: wkt2_conversion_to_projjson(wkt2_find(node, 'CONVERSION'))
  };
  var cs = wkt2_cs_to_projjson(node);
  if (cs) out.coordinate_system = cs;
  var id = wkt2_id_to_projjson(node);
  if (id) out.id = id;
  return out;
}

function wkt2_geogcrs_to_projjson(node) {
  if (!node) wkt_error('projjson_from_proj4: missing GEOGCRS node');
  var out = {
    type: 'GeographicCRS',
    name: wkt2_name_of(node) || 'Unknown'
  };
  var ensemble = wkt2_find(node, 'ENSEMBLE');
  var datum = wkt2_find(node, 'DATUM') || wkt2_find(node, 'GEODETICDATUM');
  if (ensemble) out.datum_ensemble = wkt2_ensemble_to_projjson(ensemble);
  else if (datum) out.datum = wkt2_datum_to_projjson(datum);
  var pm = wkt2_find(node, 'PRIMEM') || wkt2_find(node, 'PRIMEMERIDIAN');
  if (pm) out.prime_meridian = wkt2_primem_to_projjson(pm);
  var cs = wkt2_cs_to_projjson(node);
  if (cs) out.coordinate_system = cs;
  var id = wkt2_id_to_projjson(node);
  if (id) out.id = id;
  return out;
}

function wkt2_boundcrs_to_projjson(node) {
  var src = wkt2_find(node, 'SOURCECRS');
  var dst = wkt2_find(node, 'TARGETCRS');
  var tr = wkt2_find(node, 'ABRIDGEDTRANSFORMATION');
  var sourceNode = null, targetNode = null;
  if (src) {
    for (var i = 1; i < src.length; i++) if (Array.isArray(src[i])) { sourceNode = src[i]; break; }
  }
  if (dst) {
    for (var j = 1; j < dst.length; j++) if (Array.isArray(dst[j])) { targetNode = dst[j]; break; }
  }
  return {
    type: 'BoundCRS',
    source_crs: sourceNode ? wkt2_node_to_projjson(sourceNode) : null,
    target_crs: targetNode ? wkt2_node_to_projjson(targetNode) : null,
    transformation: wkt2_transformation_to_projjson(tr)
  };
}

function wkt2_transformation_to_projjson(node) {
  if (!node) return null;
  var out = {name: wkt2_name_of(node) || 'Transformation'};
  var method = wkt2_find(node, 'METHOD');
  if (method) {
    out.method = {name: wkt2_name_of(method) || 'Unknown method'};
    var mid = wkt2_id_to_projjson(method);
    if (mid) out.method.id = mid;
  }
  var params = wkt2_find_all(node, 'PARAMETER');
  out.parameters = params.map(function(p) {
    var param = {name: wkt2_name_of(p), value: wkt2_first_number(p)};
    var unit = wkt2_unit_to_projjson(wkt2_find(p, 'ANGLEUNIT') || wkt2_find(p, 'LENGTHUNIT') || wkt2_find(p, 'SCALEUNIT'));
    if (unit) param.unit = unit;
    var id = wkt2_id_to_projjson(p);
    if (id) param.id = id;
    return param;
  });
  return out;
}

function wkt2_conversion_to_projjson(node) {
  if (!node) return null;
  var out = {name: wkt2_name_of(node) || 'Conversion'};
  var method = wkt2_find(node, 'METHOD');
  out.method = {name: method ? wkt2_name_of(method) : 'Unknown method'};
  var mid = method ? wkt2_id_to_projjson(method) : null;
  if (mid) out.method.id = mid;
  var params = wkt2_find_all(node, 'PARAMETER');
  out.parameters = params.map(function(p) {
    var param = {name: wkt2_name_of(p), value: wkt2_first_number(p)};
    var unit = wkt2_unit_to_projjson(wkt2_find(p, 'ANGLEUNIT') || wkt2_find(p, 'LENGTHUNIT') || wkt2_find(p, 'SCALEUNIT'));
    if (unit) param.unit = unit;
    var id = wkt2_id_to_projjson(p);
    if (id) param.id = id;
    return param;
  });
  return out;
}

function wkt2_datum_to_projjson(node) {
  var out = {type: 'GeodeticReferenceFrame', name: wkt2_name_of(node) || 'Unknown'};
  var ell = wkt2_find(node, 'ELLIPSOID') || wkt2_find(node, 'SPHEROID');
  if (ell) out.ellipsoid = wkt2_ellipsoid_to_projjson(ell);
  var id = wkt2_id_to_projjson(node);
  if (id) out.id = id;
  return out;
}

function wkt2_ensemble_to_projjson(node) {
  var out = {name: wkt2_name_of(node) || 'Unknown ensemble'};
  out.members = wkt2_find_all(node, 'MEMBER').map(function(m) { return {name: wkt2_name_of(m)}; });
  var ell = wkt2_find(node, 'ELLIPSOID') || wkt2_find(node, 'SPHEROID');
  if (ell) out.ellipsoid = wkt2_ellipsoid_to_projjson(ell);
  var acc = wkt2_find(node, 'ENSEMBLEACCURACY');
  if (acc) out.accuracy = String(wkt2_first_number(acc));
  var id = wkt2_id_to_projjson(node);
  if (id) out.id = id;
  return out;
}

function wkt2_ellipsoid_to_projjson(node) {
  var nums = [];
  for (var i = 1; i < node.length; i++) {
    if (typeof node[i] === 'number') nums.push(node[i]);
  }
  var out = {
    name: wkt2_name_of(node) || 'Unknown',
    semi_major_axis: nums.length > 0 ? nums[0] : 6378137,
    inverse_flattening: nums.length > 1 ? nums[1] : 298.257223563
  };
  var unit = wkt2_unit_to_projjson(wkt2_find(node, 'LENGTHUNIT'));
  if (unit) out.unit = unit;
  var id = wkt2_id_to_projjson(node);
  if (id) out.id = id;
  return out;
}

function wkt2_primem_to_projjson(node) {
  var out = {name: wkt2_name_of(node) || 'Greenwich', longitude: wkt2_first_number(node)};
  var unit = wkt2_unit_to_projjson(wkt2_find(node, 'ANGLEUNIT'));
  if (unit) out.unit = unit;
  var id = wkt2_id_to_projjson(node);
  if (id) out.id = id;
  return out;
}

function wkt2_cs_to_projjson(node) {
  var cs = wkt2_find(node, 'CS');
  var axes = wkt2_find_all(node, 'AXIS');
  if (!cs && axes.length === 0) return null;
  var out = {
    subtype: cs && cs[1] ? String(cs[1]).toLowerCase() : 'ellipsoidal',
    axis: axes.map(function(a) {
      var ax = {
        name: wkt2_name_of(a),
        direction: wkt2_axis_direction(a)
      };
      var unit = wkt2_unit_to_projjson(wkt2_find(a, 'ANGLEUNIT') || wkt2_find(a, 'LENGTHUNIT') || wkt2_find(a, 'SCALEUNIT'));
      if (unit) {
        // PROJJSON accepts both string unit and object; keep compact for common units.
        if (unit.name === 'degree' && unit.conversion_factor === 0.0174532925199433) ax.unit = 'degree';
        else if (unit.name === 'metre' && unit.conversion_factor === 1) ax.unit = 'metre';
        else if (unit.name === 'unity' && unit.conversion_factor === 1) ax.unit = 'unity';
        else ax.unit = unit;
      }
      return ax;
    })
  };
  return out;
}

function wkt2_unit_to_projjson(node) {
  if (!node) return null;
  var kind = node[0] === 'ANGLEUNIT' ? 'AngularUnit' :
             node[0] === 'SCALEUNIT' ? 'ScaleUnit' : 'LinearUnit';
  var name = node[1] || (kind === 'LinearUnit' ? 'metre' : kind === 'AngularUnit' ? 'degree' : 'unity');
  var factor = node[2] == null ? 1 : node[2];
  return {type: kind, name: name, conversion_factor: factor};
}

function wkt2_id_to_projjson(node) {
  var id = wkt2_find(node, 'ID');
  if (!id || id.length < 3) return null;
  return {authority: id[1], code: id[2]};
}

function wkt2_first_number(node) {
  if (!node) return null;
  for (var i = 1; i < node.length; i++) {
    if (typeof node[i] === 'number') return node[i];
  }
  return null;
}
