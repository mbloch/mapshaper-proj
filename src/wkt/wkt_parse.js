

function wkt_parse(str) {
  var obj = {};
  wkt_unpack(str).forEach(function(part) {
    wkt_parse_reorder(part, obj);
  });
  return obj;
}

// Convert WKT string to a JS object
// WKT format: http://docs.opengeospatial.org/is/12-063r5/12-063r5.html#11
function wkt_unpack(str) {
  var obj;
  // Convert WKT escaped quotes to JSON escaped quotes
  // str = str.replace(/""/g, '\\"'); // BUGGY
  str = convert_wkt_quotes(str);

  // Convert WKT entities to JSON arrays
  // str = str.replace(/([A-Z0-9]+)\[/g, '["$1",');
  // Changed to ignore some names that look like entities, like "GCS_TWD97[2020]"
  // allow only [ or , character before the next quote (i.e. block close quotes)
  str = str.replace(/([A-Z0-9]+)\[(?![^"]*[^\[,"]")/g, '["$1",');

  // Enclose axis keywords in quotes to create valid JSON strings
  str = str.replace(/, *([a-zA-Z]+) *(?=[,\]])/g, ',"$1"');

  // str = str.replace(/[^\]]*$/, ''); // esri .prj string may have extra stuff appended

  // WKT may have a "VERTCS" section after "PROJCS" section; enclosing contents
  //   in brackets to create valid JSON array.
  str = '[' + str + ']';

  try {
    obj = JSON.parse(str);
  } catch(e) {
    wkt_error('unparsable WKT format');
  }
  return obj;
}

// Convert WKT escaped quotes to JSON escaped quotes ("" -> \")
function convert_wkt_quotes(str) {
  var c = 0;
  return str.replace(/"+/g, function(s) {
    var even = c % 2 == 0;
    c += s.length;
    // ordinary, unescaped quotes
    if (s == '"' || s == '""' && even) return s;
    // WKT-escaped quotes
    if (even) {
      return '"' + s.substring(1).replace(/""/g, '\\"');
    } else {
      return s.replace(/""/g, '\\"');
    }
  });
}

// Rearrange a subarray of a parsed WKT file for easier traversal
// E.g.
//   ["WGS84", ...]  to  {NAME: "WGS84"}
//   ["PROJECTION", "Mercator"]  to  {PROJECTION: "Mercator"}
//   ["PARAMETER", <param1>], ...  to  {PARAMETER: [<param1>, ...]}
function wkt_parse_reorder(arr, obj) {
  var name = arr[0], // TODO: handle alternate OGC names
      i;
  if (name == 'GEOGCS' || name == 'GEOCCS' || name == 'PROJCS' || name == 'DATUM' || name == 'VERTCS') {
    obj[name] = {
      NAME: arr[1]
    };
    for (i=2; i<arr.length; i++) {
      if (Array.isArray(arr[i])) {
        wkt_parse_reorder(arr[i], obj[name]);
      } else {
        throw wkt_error("WKT parse error");
      }
    }
  } else if (name == 'AXIS' || name == 'PARAMETER') {
    if (name in obj === false) {
      obj[name] = [];
    }
    obj[name].push(arr.slice(1));

  } else {
    obj[name] = arr.slice(1);
  }
  return obj;
}
