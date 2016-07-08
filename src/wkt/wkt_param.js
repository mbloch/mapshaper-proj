
/*
proj4 unusual params
lat_ts
  see http://spatialreference.org/ref/epsg/3078/
  +proj=stere +lat_0=90 +lat_ts=90 +lon_0=0 +k=0.994 +x_0=2000000 +y_0=2000000 +ellps=WGS84 +datum=WGS84 +units=m +no_defs
alpha  (omerc, ocea)
gamma
*/

var wkt_params = [
  ['x_0', 'false_easting'],
  ['y_0', 'false_northing'],
  ['k_0', 'scale_factor'],
  ['lon_0', 'longitude_of_center'],
  ['lat_0', 'latitude_of_center'],
  ['lat_1', 'standard_parallel_1'],
  ['lat_2', 'standard_parallel_2'],
  ['lat_1', 'latitude_of_point_1'],
  ['lon_1', 'longitude_of_point_1'],
  ['lon_2', 'longitude_of_point_2'],
  ['lat_1', 'latitude_of_point_1'],
  ['lat_2', 'latitude_of_point_2'],
  ['h', 'height'] // e.g. nsper
];

var wkt_param_aliases = {
  central_meridian: 'longitude_of_center',
  latitude_of_origin: 'latitude_of_center',
  longitude_of_1st_point: 'longitude_of_point_1',
  longitude_of_2nd_point: 'longitude_of_point_2',
  latitude_of_1st_point: 'latitude_of_point_1',
  latitude_of_2nd_point: 'latitude_of_point_2',
};

function wkt_find_param(wktName) {
  for (var i=0; i<wkt_params.length; i++) {
    if (wkt_params[i][1] == wktName) {
      return wkt_params[i][0];
    }
  }
  return '';
}

function wkt_harmonize_param_name(name) {
  name = name.toLowerCase();
  return wkt_param_aliases[name] || name;
}

function wkt_convert_params(params, projDefn, unitDefn) {
  var index = {};
  var parts = [];
  params.forEach(function(param) {
    var pair = wkt_convert_param(param, projDefn, unitDefn),
        val, name;
    if (pair) {
      name = pair[0];
      val = pair[1];
      index[name] = val;
      // TODO: consider if val might need special formatting
      parts.push('+' + name + '=' + val);
    }
  });
  // special cases
  if (projDefn.proj == 'lcc') {
    if ('lat_0' in index && 'lat_1' in index === false) {
      // SP1 version of lcc
      parts.push('+lat_1=' + index.lat_0);
    }
  }
  if (projDefn.proj == 'omerc') {
    if (projDefn.wkt == 'Hotine_Oblique_Mercator' || projDefn.wkt == 'Hotine_Oblique_Mercator_Azimuth_Natural_Origin') {
      parts.push('+no_uoff');
    }
  }
  return parts.join(' ');
}

function wkt_convert_param(param, projDefn, unitDefn) {
  var projName = projDefn.proj;
  var wktName = wkt_harmonize_param_name(param[0]);
  var val = param[1];
  var p4Name;

  // special cases
  if (projName == 'stere') {
    if (wktName == 'standard_parallel_1') p4Name = 'lat_0'; // ESRI
  }
  if (projName == 'omerc') {
    // see http://spatialreference.org/ref/epsg/3078/
    if (wktName == 'longitude_of_center') p4Name = 'lonc';
    if (wktName == 'azimuth') p4Name = 'alpha';
    if (wktName == 'rectified_grid_angle') p4Name = 'gamma';
  }
  if (projName == 'merc') {
    if (projDefn.wkt == 'Mercator_2SP' && wktName == 'standard_parallel_1') {
      p4Name = 'lat_ts';
    }
  }
  if (projName == 'eqc') {
    if (wktName == 'standard_parallel_1') {
      p4Name = 'lat_ts';
    }
  }

  // general case
  if (!p4Name) {
    p4Name = wkt_find_param(wktName);
  }

  if (p4Name == 'x_0' || p4Name == 'y_0' || p4Name == 'h') {
    val *= unitDefn.to_meter;
  }

  if (WKT_OMIT_DEFAULTS) {
    if ('x_0,y_0,lat_0,lon_0'.indexOf(p4Name) > -1 && val === 0 ||
      p4Name == 'k_0' && val == 1) {
      return;
    }
  }

  if (p4Name) {
    return [p4Name, val];
  }

  wkt_warn('unhandled param: ' + param[0]);
}
