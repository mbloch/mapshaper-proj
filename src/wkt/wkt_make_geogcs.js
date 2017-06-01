/* @requires pj_datums, pj_ellps */

// Functions for exporting a wkt GEOGCS definition

function wkt_make_geogcs(P) {
  var geogcs = {
    NAME: wkt_get_geogcs_name(P),
    DATUM: wkt_make_datum(P),
    PRIMEM: ['Greenwich', 0], // TODO: don't assume greenwich
    UNIT: ['degree', 0.017453292519943295] // TODO: support other units
  };
  return geogcs;
}

function wkt_make_datum(P) {
  var datum = {
    NAME: wkt_get_datum_name(P),
    SPHEROID: wkt_make_spheroid(P)
  };
  var towgs84 = pj_param(P.params, 'stowgs84');
  if (/[1-9]/.test(towgs84)) { // only adding TOWGS84 if transformation is non-zero
    datum.TOWGS84 = towgs84;
  }
  return datum;
}

function wkt_make_spheroid(P) {
  var rf;
  if (pj_param(P.params, 'trf')) {
    rf = pj_param(P.params, 'drf');
  } else if (P.es) {
    rf = 1 / (1 - Math.sqrt(1 - P.es));
  } else {
    rf = 0;
  }
  return [wkt_get_ellps_name(P), P.a, rf];
}

function wkt_get_geogcs_name(P) {
  var name;
  if (pj_is_latlong(P)) {
    name = wkt_get_init_name(P);
  }
  if (!name) {
    name = wkt_get_datum_id(P);
    if (/^[a-z]+$/.test(name)) {
      name = name[0].toUpperCase() + name.substr(1);
    } else {
      name = name.toUpperCase();
    }
  }
  return name || 'UNK';
}

function wkt_get_ellps_name(P) {
  var ellps = find_ellps(wkt_get_ellps_id(P));
  return ellps ? ellps.name : 'Unknown ellipsoid';
}

function wkt_get_datum_name(P) {
  var defn = find_datum(wkt_get_datum_id(P));
  return defn && defn.name || 'Unknown datum';
}

function wkt_get_datum_id(P) {
  return pj_param(P.params, 'sdatum');
}

function wkt_get_ellps_id(P) {
  var datumId = wkt_get_datum_id(P),
      datum = datumId ? find_datum(datumId) : null,
      ellpsId;
  if (datum) {
    ellpsId = datum.ellipse_id;
  } else {
    ellpsId = pj_param(P.params, 'sellps');
  }
  return ellpsId || '';
}
