/* @requires wkt_common */

// WKT2 tree -> text serializer. The input must be the same nested-array
// shape that wkt2_parse emits (e.g. ["PROJCRS", "name", [...], ...]).
//
// Options:
//   opts.pretty   - if truthy, indent the output
//   opts.indent   - string to use per indent level (default "  ")
//
// A small set of string values are emitted as bare identifiers per the
// WKT2 grammar (CS types, AXIS directions, RANGEMEANING enums). Everything
// else is double-quoted with `""` escaping.

var WKT2_BARE_IDENTS = {
  // CS types
  'Cartesian': 1, 'ellipsoidal': 1, 'spherical': 1, 'vertical': 1,
  'polar': 1, 'cylindrical': 1, 'linear': 1, 'parametric': 1,
  'affine': 1, 'temporal': 1,
  // axis directions
  'east': 1, 'north': 1, 'south': 1, 'west': 1,
  'up': 1, 'down': 1,
  'geocentricX': 1, 'geocentricY': 1, 'geocentricZ': 1,
  'clockwise': 1, 'counterClockwise': 1,
  'columnPositive': 1, 'columnNegative': 1,
  'rowPositive': 1, 'rowNegative': 1,
  'displayRight': 1, 'displayLeft': 1, 'displayUp': 1, 'displayDown': 1,
  'forward': 1, 'aft': 1, 'port': 1, 'starboard': 1,
  'future': 1, 'past': 1,
  'awayFrom': 1, 'towards': 1, 'unspecified': 1,
  // range meaning
  'exact': 1, 'wraparound': 1,
  // pixel-in-cell (for engineering CRS)
  'cellCenter': 1, 'cellCorner': 1
};

function wkt2_stringify(node, opts) {
  opts = opts || {};
  var indent = opts.indent || '  ';
  var pretty = !!opts.pretty;
  return wkt2_render(node, pretty ? 0 : -1, indent);
}

function wkt2_render(node, level, indent) {
  if (!Array.isArray(node)) {
    return wkt2_render_scalar(node);
  }
  var keyword = node[0];
  var args = node.slice(1);
  var rendered = args.map(function(a) {
    return wkt2_render(a, level >= 0 ? level + 1 : -1, indent);
  });
  if (level < 0) {
    return keyword + '[' + rendered.join(',') + ']';
  }
  var hasChild = args.some(function(a) { return Array.isArray(a); });
  if (!hasChild) {
    return keyword + '[' + rendered.join(',') + ']';
  }
  var pad = repeat(indent, level);
  var childPad = repeat(indent, level + 1);
  // Put leading scalar args (non-array) on the opening line with the keyword,
  // then each child node on its own line.
  var lead = [];
  var trail = [];
  var seenChild = false;
  for (var i = 0; i < args.length; i++) {
    if (Array.isArray(args[i])) {
      seenChild = true;
      trail.push(rendered[i]);
    } else if (!seenChild) {
      lead.push(rendered[i]);
    } else {
      trail.push(rendered[i]);
    }
  }
  var parts = [];
  if (lead.length) parts.push(lead.join(','));
  trail.forEach(function(t) { parts.push(t); });
  return keyword + '[' +
    (lead.length ? lead.join(',') + ',' : '') +
    '\n' + childPad +
    trail.join(',\n' + childPad) +
    ']';
}

function wkt2_render_scalar(v) {
  if (typeof v === 'number') return wkt2_render_number(v);
  if (typeof v === 'string') {
    if (WKT2_BARE_IDENTS[v]) return v;
    return '"' + v.replace(/"/g, '""') + '"';
  }
  if (v == null) return '""';
  return String(v);
}

function wkt2_render_number(n) {
  if (!isFinite(n)) wkt_error('wkt2_stringify: non-finite number');
  // Avoid exponent notation for typical geographic magnitudes; fall back to
  // the default toString() otherwise. Node's default already produces
  // compact output (e.g. 0.9996, 6378137), which is what we want.
  return String(n);
}

function repeat(s, n) {
  var out = '';
  for (var i = 0; i < n; i++) out += s;
  return out;
}
