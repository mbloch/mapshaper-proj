

function wkt_convert_geogcs(geogcs, opts) {
  var datum = geogcs.DATUM,
      spheroid = datum.SPHEROID,
      datumName = wkt_harmonize_geo_name(datum.NAME),
      sphName = wkt_harmonize_geo_name(spheroid[0]),
      aux_sphere = opts && opts.aux_sphere,
      a = spheroid[1],
      rf = spheroid[2],
      str, pm;

  wkt_check_units(geogcs.UNIT, 'degree');

  if (aux_sphere) {
    // TODO: in addition to semimajor, ESRI supports spheres based on
    //   semiminor and authalic radii; could support these
    str = '+a=' + spheroid[1];
  } else if (datumName == 'wgs1984') {
    str = '+datum=WGS84';
  } else if (datumName == 'northamerican1983') {
    str = '+datum=NAD83';
  } else if (datumName == 'osgb1936') {
    str = '+datum=OSGB36';
  } else if (sphName == 'grs1980') {
    str = '+ellps=GRS80';
  } else {
  // TODO: consider identifying more datums or ellipsoids by name
   str = '+a=' + a;
    if (rf > 0) {
      str += ' +rf=' + rf;
    }
  }
  if (datum.TOWGS84 && !aux_sphere) {
    str += ' +towgs84=' + datum.TOWGS84.join(',');
  }

  pm = geogcs.PRIMEM ? geogcs.PRIMEM[1] : 0;
  if (pm > 0 || pm < 0) {
    str += ' +pm=' + pm; // assuming degrees
  }
  return str;
}

function wkt_harmonize_geo_name(name) {
  return name.replace(/^(GCS|D)_/i, '').replace(/[ _]/g, '').toLowerCase();
}

function wkt_check_units(UNIT, expect) {
  if (UNIT && UNIT[0].toLowerCase() != expect) {
    wkt_error("unexpected geographic units: " + geogcs.UNIT[0]);
  }
}
