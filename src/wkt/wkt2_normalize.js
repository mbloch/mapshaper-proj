/* @requires wkt2_parse, wkt2_epsg, wkt_convert_geogcs, wkt_common */

// PROTOTYPE: Convert a parsed WKT2 tree into the object shape that
// wkt_convert_projcs / wkt_convert_geogcs already understand. Heavy lifting
// is delegated to the existing WKT1 layer.
//
// Returned shape (same as wkt_parse_reorder output):
//   { PROJCS: {NAME, GEOGCS, PROJECTION, PARAMETER, UNIT} }  --or--
//   { GEOGCS: {NAME, DATUM, PRIMEM, UNIT} }
//
// For a few cases (Krovak, Swiss Oblique Mercator) we bypass the WKT1
// converter and produce the Proj4 string directly via an optional
// `_direct_proj4` key that wkt2_to_proj4 checks for.

function wkt2_normalize(node) {
  if (!Array.isArray(node)) wkt_error('WKT2 normalize error: not a parsed node');
  var kw = node[0];
  switch (kw) {
    case 'PROJCRS':
    case 'PROJECTEDCRS':
      return {PROJCS: wkt2_normalize_projcs(node)};
    case 'GEOGCRS':
    case 'GEODCRS':
    case 'GEODETICCRS':
    case 'GEOGRAPHICCRS':
      return {GEOGCS: wkt2_normalize_geogcs(node, true)};
    case 'BOUNDCRS':
      // Unwrap: use the SOURCECRS as the effective CRS. The transformation
      // may contribute a TOWGS84 to the datum, but for the prototype we
      // just drop it with a warning.
      var src = wkt2_find(node, 'SOURCECRS');
      if (!src) wkt_error('BOUNDCRS missing SOURCECRS');
      var inner = null;
      for (var i = 1; i < src.length; i++) {
        if (Array.isArray(src[i])) { inner = src[i]; break; }
      }
      if (!inner) wkt_error('BOUNDCRS SOURCECRS has no inner CRS');
      var normalized = wkt2_normalize(inner);
      var abridged = wkt2_find(node, 'ABRIDGEDTRANSFORMATION');
      if (abridged) {
        wkt2_apply_abridged_transformation(normalized, abridged);
      }
      return normalized;
    case 'COMPOUNDCRS':
      wkt_error('COMPOUNDCRS not supported');
    case 'VERTCRS':
    case 'VERTICALCRS':
      wkt_error('VERTCRS not supported');
    case 'ENGCRS':
    case 'ENGINEERINGCRS':
      wkt_error('ENGINEERINGCRS not supported');
    default:
      wkt_error('Unsupported WKT2 root element: ' + kw);
  }
}

// --- GEOGCRS / BASEGEOGCRS --------------------------------------------------

// @isTopLevel True if the node is a top-level GEOGCRS (has CS, AXIS); false
// if it's a BASEGEOGCRS wrapped inside a PROJCRS (no CS/AXIS).
function wkt2_normalize_geogcs(node, isTopLevel) {
  var name = wkt2_name_of(node);
  var datum = wkt2_find(node, 'DATUM') ||
              wkt2_find(node, 'GEODETICDATUM') ||
              wkt2_find(node, 'ENSEMBLE');
  var primem = wkt2_find(node, 'PRIMEM') ||
               wkt2_find(node, 'PRIMEMERIDIAN');
  var geogcs = {
    NAME: name || 'Unknown',
    DATUM: wkt2_normalize_datum(datum),
    PRIMEM: wkt2_normalize_primem(primem),
    UNIT: ['degree', 0.0174532925199433]
  };
  return geogcs;
}

// Map from harmonized WKT2 datum/ensemble name to a canonical name that
// wkt_find_datum_id will recognise via pj_datums. Only the common cases
// where the WKT2 form differs meaningfully from the WKT1 form need entries
// here; the existing ESRI aliases in wkt_find_datum_id cover the rest.
var wkt2_datum_name_aliases = {
  'worldgeodeticsystem1984': 'WGS_1984',
  'worldgeodeticsystem1984ensemble': 'WGS_1984'
};

function wkt2_normalize_datum(datumNode) {
  if (!datumNode) wkt_error('WKT2 normalize: missing DATUM');
  var name = wkt2_name_of(datumNode);
  // ENSEMBLE keeps the ensemble name as the datum name; strip trailing
  // " ensemble" for a cleaner WKT1-style name.
  if (datumNode[0] === 'ENSEMBLE' && /\s+ensemble$/i.test(name)) {
    name = name.replace(/\s+ensemble$/i, '');
  }
  var harmonized = wkt2_normalize_name(name);
  if (wkt2_datum_name_aliases[harmonized]) {
    name = wkt2_datum_name_aliases[harmonized];
  }
  var ellipsoid = wkt2_find(datumNode, 'ELLIPSOID') ||
                  wkt2_find(datumNode, 'SPHEROID');
  if (!ellipsoid) wkt_error('WKT2 normalize: DATUM/ENSEMBLE missing ELLIPSOID');
  var spheroid = wkt2_normalize_ellipsoid(ellipsoid);
  var out = {
    NAME: name || 'Unknown',
    SPHEROID: spheroid
  };
  // TOWGS84 is not part of WKT2 DATUM; BOUNDCRS handling adds it later if
  // applicable.
  return out;
}

// WKT2 ellipsoid name -> Proj4 `+ellps=` id. Only for names that don't
// already match pj_ellps through wkt_find_ellps_id (which is sensitive to
// punctuation, e.g. "Clarke 1880 (IGN)" vs "Clarke 1880 (IGN).").
var wkt2_ellipsoid_name_aliases = {
  'clarke1880ign': 'Clarke 1880 (IGN).',  // match pj_ellps entry verbatim
  'clarke1858': 'Clarke 1858',
  'krassowsky1940': 'Krasovsky 1940'      // pj_ellps uses "Krasovsky" spelling
};

function wkt2_normalize_ellipsoid(ellipsoidNode) {
  // ELLIPSOID["name", a, rf, LENGTHUNIT[...]]
  var name = wkt2_name_of(ellipsoidNode);
  var harmonized = wkt2_normalize_name(name);
  if (wkt2_ellipsoid_name_aliases[harmonized]) {
    name = wkt2_ellipsoid_name_aliases[harmonized];
  }
  var a = null, rf = null;
  var numCount = 0;
  for (var i = 1; i < ellipsoidNode.length; i++) {
    if (typeof ellipsoidNode[i] === 'number') {
      numCount++;
      if (numCount === 1) a = ellipsoidNode[i];
      else if (numCount === 2) rf = ellipsoidNode[i];
    }
  }
  if (a == null) wkt_error('WKT2 normalize: ELLIPSOID missing semi-major axis');
  var lu = wkt2_find(ellipsoidNode, 'LENGTHUNIT');
  if (lu) {
    var toMeter = wkt2_unit_factor(lu);
    if (toMeter && toMeter !== 1) a = a * toMeter;
  }
  return [name || 'Unknown', a, rf == null ? 0 : rf];
}

function wkt2_normalize_primem(primemNode) {
  if (!primemNode) return ['Greenwich', 0];
  var name = wkt2_name_of(primemNode);
  var longitude = 0;
  for (var i = 1; i < primemNode.length; i++) {
    if (typeof primemNode[i] === 'number') { longitude = primemNode[i]; break; }
  }
  // Convert to degrees if ANGLEUNIT is not degrees
  var au = wkt2_find(primemNode, 'ANGLEUNIT') || wkt2_find(primemNode, 'UNIT');
  if (au) {
    var factor = wkt2_unit_factor(au); // radians per unit
    if (factor) {
      // 0.0174532925199433 radians == 1 degree. If factor matches that,
      // value is already in degrees; otherwise convert.
      var degreeFactor = 0.0174532925199433;
      if (Math.abs(factor - degreeFactor) > 1e-15) {
        longitude = longitude * factor / degreeFactor;
      }
    }
  }
  return [name || 'Greenwich', longitude];
}

// --- PROJCRS ---------------------------------------------------------------

function wkt2_normalize_projcs(node) {
  var name = wkt2_name_of(node);
  var base = wkt2_find(node, 'BASEGEOGCRS') ||
             wkt2_find(node, 'BASEGEODCRS');
  if (!base) wkt_error('PROJCRS missing BASEGEOGCRS');
  var conv = wkt2_find(node, 'CONVERSION');
  if (!conv) wkt_error('PROJCRS missing CONVERSION');
  var methodNode = wkt2_find(conv, 'METHOD') ||
                   wkt2_find(conv, 'PROJECTION');
  var method = wkt2_lookup_method(methodNode);
  if (!method) {
    wkt_error('Unsupported WKT2 projection method: ' +
              (wkt2_name_of(methodNode) || '[unknown]'));
  }

  var cs = wkt2_find(node, 'CS');
  var axes = wkt2_find_all(node, 'AXIS');
  var csUnit = wkt2_projcs_length_unit(node, axes);

  // Collect parameters into WKT1 [[name, value], ...] form
  var paramNodes = wkt2_find_all(conv, 'PARAMETER');
  var params = [];
  for (var i = 0; i < paramNodes.length; i++) {
    var p = wkt2_normalize_parameter(paramNodes[i]);
    if (p) params.push(p);
  }

  var projcs = {
    NAME: name,
    GEOGCS: wkt2_normalize_geogcs(base, false),
    // wkt_parse_reorder stores PROJECTION as a single-element array, so the
    // adapter tests (get_simple_parser_test) expect projcs.PROJECTION[0].
    PROJECTION: [method.wkt1 || 'Unknown'],
    PARAMETER: params,
    UNIT: csUnit
  };

  // Mercator variant A (EPSG 9804) defines "Latitude of natural origin" but
  // for a Mercator it is always 0. The WKT1 Mercator adapter's 1SP rule
  // would otherwise emit "+lat_ts=0", which is noise. Drop latitude_of_origin
  // if it's zero on this method.
  if (methodNode) {
    var mcode = wkt2_id_code(methodNode);
    if (mcode === 9804 || mcode === 1026) {
      projcs = projcs; // (no-op, keep linter happy below)
      for (var pi = params.length - 1; pi >= 0; pi--) {
        if (params[pi][0] === 'latitude_of_origin' && params[pi][1] === 0) {
          params.splice(pi, 1);
        }
      }
    }
  }

  // Special cases: return a direct Proj4 string instead of going through
  // the WKT1 adapter chain.
  if (method.special === 'aux_sphere') {
    projcs._direct_proj4 = wkt2_build_popular_visualisation_proj4(projcs);
  } else if (method.special === 'somerc') {
    projcs._direct_proj4 = wkt2_build_somerc_proj4(projcs);
  } else if (method.special === 'krovak' || method.special === 'krovak_north') {
    projcs._direct_proj4 = wkt2_build_krovak_proj4(projcs, method.special === 'krovak_north');
  }

  // Attach AXIS so downstream formatting knows about non-standard order, even
  // though we don't emit +axis today.
  if (axes.length > 0) {
    projcs.AXIS = axes.map(function(a) {
      // Strip nested entities for the WKT1-shape converter; keep [name, dir]
      return [wkt2_name_of(a), wkt2_axis_direction(a)];
    });
  }
  return projcs;
}

function wkt2_normalize_parameter(paramNode) {
  var name = wkt2_lookup_parameter(paramNode);
  if (!name) {
    wkt_warn('WKT2: unknown parameter: ' + wkt2_name_of(paramNode));
    return null;
  }
  var value = null;
  for (var i = 1; i < paramNode.length; i++) {
    if (typeof paramNode[i] === 'number') { value = paramNode[i]; break; }
  }
  if (value == null) wkt_error('WKT2: parameter missing numeric value: ' + name);

  // Convert value to the parameter's "natural" unit:
  //  - Angular parameters: convert to degrees
  //  - Linear parameters: keep in the CS unit (wkt_convert_parameter applies
  //    the top-level UNIT to_meter later).
  var au = wkt2_find(paramNode, 'ANGLEUNIT');
  if (au) {
    var factor = wkt2_unit_factor(au); // radians per unit
    var degreeFactor = 0.0174532925199433;
    if (factor && Math.abs(factor - degreeFactor) > 1e-15) {
      value = value * factor / degreeFactor;
    }
  }
  // LENGTHUNIT on parameter is treated as CS-matching for linear params; no
  // conversion needed assuming it matches the projected CS UNIT.
  return [name, value];
}

function wkt2_axis_direction(axisNode) {
  // AXIS["name", direction, ...]; direction is a bare ident.
  for (var i = 2; i < axisNode.length; i++) {
    if (typeof axisNode[i] === 'string') return axisNode[i];
  }
  return 'unknown';
}

function wkt2_projcs_length_unit(projcrsNode, axes) {
  // Prefer an explicit top-level LENGTHUNIT, else use the AXIS LENGTHUNIT,
  // else default to metres.
  var lu = wkt2_find(projcrsNode, 'LENGTHUNIT');
  if (!lu && axes.length > 0) {
    lu = wkt2_find(axes[0], 'LENGTHUNIT');
  }
  if (!lu) return ['metre', 1];
  var name = wkt2_name_of(lu) || 'metre';
  return [name, wkt2_unit_factor(lu) || 1];
}

function wkt2_unit_factor(unitNode) {
  // {LENGTH|ANGLE|SCALE}UNIT["name", factor, ...]
  for (var i = 1; i < unitNode.length; i++) {
    if (typeof unitNode[i] === 'number') return unitNode[i];
  }
  return null;
}

// --- BOUNDCRS/ABRIDGEDTRANSFORMATION ---------------------------------------

// Apply a simple abridged transformation onto the normalized datum.
// Supports only Position Vector / Coordinate Frame seven-param Helmert and
// the three-param shift. Longitude rotation is applied to PRIMEM.
function wkt2_apply_abridged_transformation(normalized, abridged) {
  var methodNode = wkt2_find(abridged, 'METHOD');
  var method = wkt2_lookup_method(methodNode);
  var params = wkt2_find_all(abridged, 'PARAMETER');
  var geogcs = normalized.PROJCS ? normalized.PROJCS.GEOGCS : normalized.GEOGCS;
  if (!geogcs) return;
  var code = wkt2_id_code(methodNode);
  if (code === 9601) {
    // Longitude rotation (EPSG 9601) describes SOURCE -> Greenwich. Because
    // we're unwrapping BOUNDCRS into SOURCECRS-as-is (and keeping the
    // source's own PRIMEM, e.g. +pm=paris), the offset is already implied
    // by the prime meridian. No datum mutation needed.
    return;
  }
  // Position Vector Transformation (9606) / Coordinate Frame (9607) etc.
  // Collect seven params in order: dX, dY, dZ, rX, rY, rZ, dS (or three: dX,dY,dZ)
  // EPSG codes: 8605, 8606, 8607, 8608, 8609, 8610, 8611
  var map = {};
  for (var i = 0; i < params.length; i++) {
    var pcode = wkt2_id_code(params[i]);
    var val = null;
    for (var j = 1; j < params[i].length; j++) {
      if (typeof params[i][j] === 'number') { val = params[i][j]; break; }
    }
    if (pcode != null && val != null) map[pcode] = val;
  }
  var seven = [8605, 8606, 8607, 8608, 8609, 8610, 8611];
  var arr = [];
  var have = 0;
  for (var k = 0; k < seven.length; k++) {
    if (seven[k] in map) { arr.push(map[seven[k]]); have++; }
    else arr.push(0);
  }
  if (have >= 3) {
    // Per EPSG "abridged" convention, scale is expressed as 1+dS*1e-6 minus 1;
    // ratio is ~ppm. Proj4 +towgs84 uses ppm too.
    if (code === 9607) {
      // Coordinate Frame -> Position Vector: negate rotations
      arr[3] = -arr[3]; arr[4] = -arr[4]; arr[5] = -arr[5];
    }
    geogcs.DATUM.TOWGS84 = arr;
  }
}

// --- Special-case direct Proj4 builders ------------------------------------

function wkt2_find_param_by_name(projcs, wkt1Name) {
  for (var i = 0; i < projcs.PARAMETER.length; i++) {
    if (projcs.PARAMETER[i][0] === wkt1Name) return projcs.PARAMETER[i][1];
  }
  return undefined;
}

function wkt2_proj4_geogcs_part(geogcs) {
  return wkt_convert_geogcs(geogcs);
}

function wkt2_build_popular_visualisation_proj4(projcs) {
  // EPSG method 1024. Treat ellipsoid as sphere of radius 6378137.
  var lon_0 = wkt2_find_param_by_name(projcs, 'central_meridian');
  var x_0 = wkt2_find_param_by_name(projcs, 'false_easting');
  var y_0 = wkt2_find_param_by_name(projcs, 'false_northing');
  var parts = ['+proj=merc'];
  parts.push('+a=6378137');
  if (lon_0) parts.push('+lon_0=' + lon_0);
  if (x_0) parts.push('+x_0=' + x_0);
  if (y_0) parts.push('+y_0=' + y_0);
  parts.push('+no_defs');
  return parts.join(' ');
}

function wkt2_build_somerc_proj4(projcs) {
  // EPSG 9815 Hotine Oblique Mercator variant B as used by Swiss LV95.
  var parts = ['+proj=somerc'];
  var lat_0 = wkt2_find_param_by_name(projcs, 'latitude_of_center');
  var lon_0 = wkt2_find_param_by_name(projcs, 'longitude_of_center');
  var k = wkt2_find_param_by_name(projcs, 'scale_factor');
  var x_0 = wkt2_find_param_by_name(projcs, 'false_easting');
  var y_0 = wkt2_find_param_by_name(projcs, 'false_northing');
  if (lat_0 != null) parts.push('+lat_0=' + lat_0);
  if (lon_0 != null) parts.push('+lon_0=' + lon_0);
  if (k != null) parts.push('+k_0=' + k);
  if (x_0 != null) parts.push('+x_0=' + x_0);
  if (y_0 != null) parts.push('+y_0=' + y_0);
  parts.push(wkt2_proj4_geogcs_part(projcs.GEOGCS));
  parts.push('+no_defs');
  return parts.filter(function(s) { return !!s; }).join(' ');
}

function wkt2_build_krovak_proj4(projcs, northOriented) {
  var parts = ['+proj=krovak'];
  var lat_0 = wkt2_find_param_by_name(projcs, 'latitude_of_center');
  var lon_0 = wkt2_find_param_by_name(projcs, 'central_meridian') ||
              wkt2_find_param_by_name(projcs, 'longitude_of_center');
  var alpha = wkt2_find_param_by_name(projcs, 'azimuth');
  var k = wkt2_find_param_by_name(projcs, 'scale_factor');
  var x_0 = wkt2_find_param_by_name(projcs, 'false_easting');
  var y_0 = wkt2_find_param_by_name(projcs, 'false_northing');
  if (lat_0 != null) parts.push('+lat_0=' + lat_0);
  if (lon_0 != null) parts.push('+lon_0=' + lon_0);
  if (alpha != null) parts.push('+alpha=' + alpha);
  if (k != null) parts.push('+k=' + k);
  if (x_0) parts.push('+x_0=' + x_0);
  if (y_0) parts.push('+y_0=' + y_0);
  parts.push(wkt2_proj4_geogcs_part(projcs.GEOGCS));
  parts.push('+no_defs');
  return parts.filter(function(s) { return !!s; }).join(' ');
}
