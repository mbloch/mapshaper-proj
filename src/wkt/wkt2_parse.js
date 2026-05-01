/* @requires wkt_common */

// PROTOTYPE: WKT2 (ISO 19162 / OGC 18-010) string parser.
//
// Produces a nested-array intermediate representation identical in spirit to
// the one wkt_unpack/wkt_parse_reorder produces for WKT1, but without the
// JSON-roundtrip hack. The parser is recursive-descent over a small tokenizer.
//
// Output shape:
//   ["PROJCRS", "WGS 84 / UTM zone 18N",
//     ["BASEGEOGCRS", "WGS 84", ...],
//     ["CONVERSION", "UTM zone 18N",
//       ["METHOD", "Transverse Mercator", ["ID", "EPSG", 9807]],
//       ["PARAMETER", "Latitude of natural origin", 0,
//         ["ANGLEUNIT", "degree", 0.0174...],
//         ["ID", "EPSG", 8801]],
//       ...],
//     ...]
//
// Strings are unescaped. Numbers are JS numbers. Bare identifiers
// (Cartesian, east, north, up, unity, grad, ellipsoidal, ...) are kept as
// strings.

function wkt2_parse(str) {
  var tokens = wkt2_tokenize(str);
  var pos = {i: 0};
  var node = wkt2_read_entity(tokens, pos);
  wkt2_skip_ws(tokens, pos); // tolerate trailing whitespace
  if (pos.i < tokens.length) {
    wkt_error('WKT2 parse error: unexpected trailing content at token ' + pos.i);
  }
  return node;
}

// --- Tokenizer -------------------------------------------------------------

var WKT2_TOK = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  IDENT: 'IDENT',
  OPEN: 'OPEN',    // [ or (
  CLOSE: 'CLOSE',  // ] or )
  COMMA: 'COMMA'
};

function wkt2_tokenize(str) {
  var tokens = [];
  var i = 0;
  var n = str.length;
  var c;
  while (i < n) {
    c = str.charAt(i);
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      i++;
    } else if (c === '[' || c === '(') {
      tokens.push({type: WKT2_TOK.OPEN, value: c, pos: i});
      i++;
    } else if (c === ']' || c === ')') {
      tokens.push({type: WKT2_TOK.CLOSE, value: c, pos: i});
      i++;
    } else if (c === ',') {
      tokens.push({type: WKT2_TOK.COMMA, value: c, pos: i});
      i++;
    } else if (c === '"') {
      // quoted string; "" is an escaped quote
      var start = i;
      var buf = '';
      i++; // skip opening quote
      while (i < n) {
        c = str.charAt(i);
        if (c === '"') {
          if (i + 1 < n && str.charAt(i + 1) === '"') {
            buf += '"';
            i += 2;
          } else {
            i++; // closing quote
            break;
          }
        } else {
          buf += c;
          i++;
        }
      }
      tokens.push({type: WKT2_TOK.STRING, value: buf, pos: start});
    } else if (c === '-' || c === '+' || c === '.' || (c >= '0' && c <= '9')) {
      // number; start matches signed decimal / exponent
      var nstart = i;
      // signed or optionally leading '+' (rare but valid)
      if (c === '-' || c === '+') i++;
      while (i < n && (str.charAt(i) >= '0' && str.charAt(i) <= '9')) i++;
      if (i < n && str.charAt(i) === '.') {
        i++;
        while (i < n && (str.charAt(i) >= '0' && str.charAt(i) <= '9')) i++;
      }
      if (i < n && (str.charAt(i) === 'e' || str.charAt(i) === 'E')) {
        i++;
        if (i < n && (str.charAt(i) === '+' || str.charAt(i) === '-')) i++;
        while (i < n && (str.charAt(i) >= '0' && str.charAt(i) <= '9')) i++;
      }
      var num = parseFloat(str.substring(nstart, i));
      if (isNaN(num)) {
        wkt_error('WKT2 parse error: bad number at ' + nstart + ': ' + str.substring(nstart, i));
      }
      tokens.push({type: WKT2_TOK.NUMBER, value: num, pos: nstart});
    } else if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || c === '_') {
      var istart = i;
      while (i < n) {
        var cc = str.charAt(i);
        if ((cc >= 'A' && cc <= 'Z') || (cc >= 'a' && cc <= 'z') ||
            (cc >= '0' && cc <= '9') || cc === '_') {
          i++;
        } else {
          break;
        }
      }
      tokens.push({type: WKT2_TOK.IDENT, value: str.substring(istart, i), pos: istart});
    } else {
      wkt_error('WKT2 parse error: unexpected character ' + JSON.stringify(c) + ' at ' + i);
    }
  }
  return tokens;
}

// --- Parser ----------------------------------------------------------------

function wkt2_skip_ws(tokens, pos) {
  // no-op; tokenizer already stripped whitespace
}

function wkt2_peek(tokens, pos) {
  return tokens[pos.i];
}

function wkt2_consume(tokens, pos, type) {
  var t = tokens[pos.i];
  if (!t) wkt_error('WKT2 parse error: unexpected end of input (wanted ' + type + ')');
  if (type && t.type !== type) {
    wkt_error('WKT2 parse error: expected ' + type + ' but got ' + t.type +
              ' (' + JSON.stringify(t.value) + ') at token ' + pos.i);
  }
  pos.i++;
  return t;
}

// Read KEYWORD[ arg, arg, ... ]
function wkt2_read_entity(tokens, pos) {
  var t = wkt2_consume(tokens, pos, WKT2_TOK.IDENT);
  // WKT2 spec says keywords are case-insensitive; upper-case them for matching
  var keyword = t.value.toUpperCase();
  var node = [keyword];
  wkt2_consume(tokens, pos, WKT2_TOK.OPEN);
  // first arg is always required for a non-empty entity, but tolerate empty
  if (wkt2_peek(tokens, pos) && wkt2_peek(tokens, pos).type !== WKT2_TOK.CLOSE) {
    node.push(wkt2_read_arg(tokens, pos));
    while (wkt2_peek(tokens, pos) && wkt2_peek(tokens, pos).type === WKT2_TOK.COMMA) {
      wkt2_consume(tokens, pos, WKT2_TOK.COMMA);
      node.push(wkt2_read_arg(tokens, pos));
    }
  }
  wkt2_consume(tokens, pos, WKT2_TOK.CLOSE);
  return node;
}

function wkt2_read_arg(tokens, pos) {
  var t = wkt2_peek(tokens, pos);
  if (!t) wkt_error('WKT2 parse error: unexpected end of input reading arg');
  switch (t.type) {
    case WKT2_TOK.STRING:
      pos.i++;
      return t.value;
    case WKT2_TOK.NUMBER:
      pos.i++;
      return t.value;
    case WKT2_TOK.IDENT:
      // look ahead: if followed by OPEN, it's an entity; else it's a bare ident
      var next = tokens[pos.i + 1];
      if (next && next.type === WKT2_TOK.OPEN) {
        return wkt2_read_entity(tokens, pos);
      } else {
        pos.i++;
        return t.value;
      }
    default:
      wkt_error('WKT2 parse error: unexpected token ' + t.type +
                ' at position ' + t.pos);
  }
}

// --- Tree traversal helpers ------------------------------------------------

// Return the first child-array whose first element equals the given keyword,
// or null. Searches only the immediate children of `node`, not recursively.
function wkt2_find(node, keyword) {
  if (!Array.isArray(node)) return null;
  keyword = keyword.toUpperCase();
  for (var i = 1; i < node.length; i++) {
    if (Array.isArray(node[i]) && node[i][0] === keyword) {
      return node[i];
    }
  }
  return null;
}

// Return all immediate child-arrays whose first element equals the given keyword.
function wkt2_find_all(node, keyword) {
  var out = [];
  if (!Array.isArray(node)) return out;
  keyword = keyword.toUpperCase();
  for (var i = 1; i < node.length; i++) {
    if (Array.isArray(node[i]) && node[i][0] === keyword) {
      out.push(node[i]);
    }
  }
  return out;
}

// Return the first non-keyword (string or number) child of `node` — i.e.
// its "name" for named entities. For PROJCRS["foo", ...] returns "foo".
function wkt2_name_of(node) {
  if (!Array.isArray(node)) return null;
  for (var i = 1; i < node.length; i++) {
    if (typeof node[i] === 'string' || typeof node[i] === 'number') {
      return node[i];
    }
  }
  return null;
}

// Extract the integer code from an ID entity, if present on node.
// Returns null otherwise. Handles both ID["EPSG", 9807] (number) and
// ID["EPSG", "9807"] (string) forms.
function wkt2_id_code(node) {
  var id = wkt2_find(node, 'ID');
  if (!id) return null;
  // id == ["ID", authority, code, (optional version, ...)]
  var code = id[2];
  if (typeof code === 'number') return code;
  if (typeof code === 'string') {
    var n = parseFloat(code);
    return isNaN(n) ? null : n;
  }
  return null;
}

function wkt2_id_authority(node) {
  var id = wkt2_find(node, 'ID');
  if (!id) return null;
  return id[1] || null;
}
