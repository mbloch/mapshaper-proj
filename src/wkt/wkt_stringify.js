
function wkt_stringify(o) {
  var str = JSON.stringify(wkt_stringify_reorder(o));
  str = str.replace(/\["([A-Z0-9]+)",/g, '$1['); // convert JSON arrays to WKT
  // remove quotes from AXIS values (not supported: UP|DOWN|OTHER etc.)
  // see (http://www.geoapi.org/apidocs/org/opengis/referencing/doc-files/WKT.html)
  str = str.replace(/"(EAST|NORTH|SOUTH|WEST)"/g, '$1');
  return str;
}

function wkt_sort_order(key) {
  // supported WKT names in sorted order
  var names = 'NAME,PROJCS,GEOGCS,GEOCCS,DATUM,SPHEROID,PRIMEM,PROJECTION,PARAMETER,UNIT,AXIS';
  return names.indexOf(key) + 1 || 999;
}

function wkt_keys(o) {
  var keys = Object.keys(o);
  return keys.sort(function(a, b) {
    return wkt_sort_order(a) - wkt_sort_order(b);
  });
}


// Rearrange a generated WKT object for easier string conversion
// inverse of wkt_parse_reorder()
function wkt_stringify_reorder(o, depth) {
  var arr = [], e;
  depth = depth || 0;
  wkt_keys(o).forEach(function(name) {
    var val = o[name];
    if (wkt_is_object(val)) {
      arr.push([name].concat(wkt_stringify_reorder(val, depth + 1)));
    } else if (name == 'NAME') {
      arr.push(wkt_is_string(val) ? val : val[0]);
    } else if (name == 'PARAMETER' || name == 'AXIS') {
      val.forEach(function(param) {
        arr.push([name].concat(param));
      });
    } else if (wkt_is_string(val)) {
      arr.push([name, val]);
    } else if (Array.isArray(val)) {
       arr.push([name].concat(val));
    } else {
      e = {};
      e[name] = val;
      wkt_error("Incorrectly formatted WKT element: " + JSON.stringify(e));
    }
  });
  if (depth === 0 && arr.length == 1) {
    arr = arr[0]; // kludge to remove top-level array
  }
  return arr;
}
