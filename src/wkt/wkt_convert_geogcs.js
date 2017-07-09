/* @requires pj_ellps, pj_datums */

function wkt_convert_geogcs(geogcs, opts) {
  var datum = geogcs.DATUM,
      spheroid = datum.SPHEROID,
      datumId = wkt_find_datum_id(datum),
      ellId = wkt_find_ellps_id(spheroid),
      aux_sphere = opts && opts.aux_sphere,
      a = spheroid[1],
      rf = spheroid[2],
      str, pm;

  wkt_check_units(geogcs.UNIT, 'degree');
  if (aux_sphere) {
    // TODO: in addition to semimajor, ESRI supports spheres based on
    //   semiminor and authalic radii; could support these
    str = '+a=' + spheroid[1];
  } else if (datumId) {
    str = '+datum=' + datumId;
  } else if (ellId) {
    str = '+ellps=' + ellId;
  } else {
   str = '+a=' + a;
    if (rf > 0) {
      str += ' +rf=' + rf;
    }
  }
  if (datum.TOWGS84 && !aux_sphere && !datumId) {
    str += ' +towgs84=' + datum.TOWGS84.join(',');
  }

  pm = geogcs.PRIMEM ? geogcs.PRIMEM[1] : 0;
  if (pm > 0 || pm < 0) {
    str += ' +pm=' + pm; // assuming degrees
  }
  return str;
}

function wkt_find_ellps_id(spheroid) {
  // TODO: match on ellipsoid parameters rather than name
  var aliases = {
    international1924: "intl"
  };
  var key = wkt_harmonize_geo_name(spheroid[0]);
  var defn;
  if (key in aliases) {
    return aliases[key];
  }
  if (/^grs1980/.test(key)) {
    // handle cases like "GRS 1980(IUGG, 1980)")
    return 'GRS80';
  }
  if (key == 'sphere') {
    // not a well defined ellipsoid
    // TODO: if we check ellipsoid params, this test can go away
    return null;
  }
  for (var i=0; i<pj_ellps.length; i++) {
    defn = pj_ellps[i];
    if (wkt_harmonize_geo_name(defn[3]) == key ||
        wkt_harmonize_geo_name(defn[0]) == key) {
      break;
    }
  }
  return defn ? defn[0] : null;
}

function wkt_find_datum_id(datum) {
  var aliases = { // ESRI aliases
    northamerican1983: 'NAD83',
    newzealand1949: 'nzgd49'
  };
  var key = wkt_harmonize_geo_name(datum.NAME);
  var defn;
  if (key in aliases) {
    return aliases[key];
  }
  for (var i=0; i<pj_datums.length; i++) {
    defn = pj_datums[i];
    if (wkt_harmonize_geo_name(defn[3]) == key ||
        wkt_harmonize_geo_name(defn[0]) == key) {
      break;
    }
  }
  return defn ? defn[0] : null;
}

function wkt_harmonize_geo_name(name) {
  return (name || '').replace(/^(GCS|D)_/i, '').replace(/[ _]/g, '').toLowerCase();
}

function wkt_check_units(UNIT, expect) {
  if (UNIT && UNIT[0].toLowerCase() != expect) {
    wkt_error("unexpected geographic units: " + geogcs.UNIT[0]);
  }
}
