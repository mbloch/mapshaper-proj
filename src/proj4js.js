// Support for the proj4js api:
//    proj4(fromProjection[, toProjection, coordinates])

function proj4js(arg1, arg2, arg3) {
  var oneArg = typeof arg !== 'string';
  var p, fromStr, toStr, P1, P2, transform;
  if (oneArg) {
    fromStr = '+datum=WGS84 +proj=lonlat';
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
