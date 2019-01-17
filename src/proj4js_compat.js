// Support for the proj4js api:
//    proj4(fromProjection[, toProjection, coordinates])

function proj4js(arg1, arg2, arg3) {
  var p, fromStr, toStr, P1, P2, transform;
  if (typeof arg1 != 'string') {
    // E.g. Webpack's require function tries to initialize mproj by calling
    // the module function.
    return api;
  } else if (typeof arg2 != 'string') {
    fromStr = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs'; // '+datum=WGS84 +proj=lonlat';
    toStr = arg1;
    p = arg2;
  } else {
    fromStr = arg1;
    toStr = arg2;
    p = arg3;
  }
  P1 = pj_init(fromStr);
  P2 = pj_init(toStr);
  transform = get_proj4js_transform(P1, P2);
  if (p) {
    return transform(p);
  } else {
    return {forward: transform, inverse: get_proj4js_transform(P2, P1)};
  }
}

proj4js.WGS84 = '+proj=longlat +datum=WGS84'; // for compatibility with proj4js tests

// for compatibility with proj4js tests
proj4js.toPoint = function(array) {
  var out = {
    x: array[0],
    y: array[1]
  };
  if (array.length>2) {
    out.z = array[2];
  }
  if (array.length>3) {
    out.m = array[3];
  }
  return out;
};

function get_proj4js_transform(P1, P2) {
  return function(p) {
    var useArray = Array.isArray(p);
    p = useArray ? p.concat() : [p.x, p.y];
    pj_transform_point(P1, P2, p);
    if (!useArray) {
      p = {x: p[0], y: p[1]};
    }
    return p;
  };
}
