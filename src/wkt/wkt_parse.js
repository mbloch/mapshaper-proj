
// TODO: add OGC names
var wkt_aliases = {


};

function wkt_parse(str) {
  var obj;
  // reference http://docs.opengeospatial.org/is/12-063r5/12-063r5.html#11
  str = str.replace(/""/g, '\\"'); // convert WKT doublequote to JSON escaped quote
  str = str.replace(/([A-Z0-9]+)\[/g, '["$1",'); // convert WKT entities to JSON arrays
  // TODO: more targeted regex
  str = str.replace(/, *([a-zA-Z]+) *(?=[,\]])/g, ',"$1"'); // wrap axis direction keywords in quotes
  // str = str.replace(/[^\]]*$/, ''); // esri .prj string may have extra stuff appended
  try {
    obj = JSON.parse(str);
  } catch(e) {
    wkt_error('unparsable WKT format');
  }
  return wkt_reorder(obj, {});
}

function wkt_harmonize_keyword(name) {
  return wkt_aliases[name] || name;
}

function wkt_reorder(arr, obj) {
  var name = wkt_harmonize_keyword(arr[0]),
      i;
  if (name == 'GEOGCS' || name == 'GEOCCS' || name == 'PROJCS' || name == 'DATUM') {
    obj[name] = {
      NAME: arr[1]
    };
    for (i=2; i<arr.length; i++) {
      if (Array.isArray(arr[i])) {
        wkt_reorder(arr[i], obj[name]);
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
