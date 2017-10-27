/* @requires
pj_param
pj_datum_set
pj_ell_set
pj_units
pj_initcache
pj_open_lib
*/

// Returns an initialized projection object
// @args a proj4 string
function pj_init(args) {
  var params = pj_get_params(args);
  var P = {
    params: params,
    is_latlong: false,
    is_geocent: false,
    is_long_wrap_set: false,
    long_wrap_center: 0,
    axis: "enu",
    gridlist: null,
    gridlist_count: 0,
    vgridlist_geoid: null,
    vgridlist_geoid_count: 0
  };
  var name, defn;
  if (!Object.keys(params).length) {
    error(-1);
  }

  if (pj_param(params, "tinit")) {
    get_init(params, pj_param(params, "sinit"));
  }

  name = pj_param(params, "sproj");
  if (!name) {
    error(-4);
  }

  defn = pj_list[name];
  if (!defn) {
    error(-5);
  }

  if (!pj_param(params, "bno_defs")) {
    get_defaults(P.params, name);
  }

  pj_datum_set(P);
  pj_ell_set(P);

  P.a_orig = P.a;
  P.es_orig = P.es;
  P.e = sqrt(P.es);
  P.ra = 1 / P.a;
  P.one_es = 1 - P.es;
  if (!P.one_es) {
    error(-6);
  }
  P.rone_es = 1 / P.one_es;

  if (is_wgs84(P)) {
    P.datum_type = PJD_WGS84;
  }

  P.geoc = !!P.es && pj_param(params, 'bgeoc');
  P.over = pj_param(params, 'bover');
  P.has_geoid_vgrids = pj_param(params, 'tgeoidgrids');
  if (P.has_geoid_vgrids) {
    pj_param(params, "sgeoidgrids"); // mark as used
  }

  P.is_long_wrap_set = pj_param(params, 'tlon_wrap');
  if (P.is_long_wrap_set) {
    P.long_wrap_center = pj_param(params, 'rlon_wrap');
    // Don't accept excessive values otherwise we might perform badly
    // when correcting longitudes around it
    // The test is written this way to error on long_wrap_center "=" NaN
    if (fabs(P.long_wrap_center) < 10 * M_TWOPI === false) {
      error(-14);
    }
  }

  if (pj_param(params, 'saxis')) {
    init_axis(P);
  }

  P.lam0 = pj_param(params, 'rlon_0');
  P.phi0 = pj_param(params, 'rlat_0');
  P.x0 = pj_param(params, 'dx_0');
  P.y0 = pj_param(params, 'dy_0');

  if (pj_param(params, 'tk_0')) {
    P.k0 = pj_param(params, 'dk_0');
  } else if (pj_param(params, 'tk')) {
    P.k0 = pj_param(params, 'dk');
  } else {
    P.k0 = 1;
  }
  if (P.k0 <= 0) {
    error(-31);
  }

  init_units(P);
  init_prime_meridian(P);
  defn.init(P);
  return P;
}

// Merge default params
// NOTE: Proj.4 loads defaults from the file nad/proj_def.dat
// This function applies the default ellipsoid from proj_def.dat but
//   ignores the other defaults, which could be considered undesirable
//   (see e.g. https://github.com/OSGeo/proj.4/issues/201)
function get_defaults(params, name) {
  get_opt(params, '+ellps=WGS84');
}

function get_init(params, initStr) {
  var defn = pj_search_initcache(initStr);
  if (!defn) {
    defn = pj_read_init_opts(initStr);
    pj_insert_initcache(initStr, defn);
  }
  if (!defn) {
    error(-2);
  }
  // merge init params
  get_opt(params, defn.opts);
}

// Merge params from a proj4 string
// (Slightly different interface from Proj.4 get_opts())
function get_opt(params, args) {
  var newParams = pj_get_params(args);
  var geoIsSet = ['datum', 'ellps', 'a', 'b', 'rf', 'f'].reduce(function(memo, key) {
    return memo || key in params;
  }, false);
  Object.keys(newParams).forEach(function(key) {
    // don't override existing params
    if (key in params) return;
    // don't set ellps if earth model info is set
    if (key == 'ellps' && geoIsSet) return;
    params[key] = newParams[key];
  });
}

function init_prime_meridian(P) {
  var params = P.params,
  name, pm, offs;
  name = pj_param(params, 'spm');
  if (name) {
    pm = find_prime_meridian(name);
    offs = dmstor(pm ? pm.definition : name);
    if (isNaN(offs)) {
      error(-46);
    }
    P.from_greenwich = offs;
  } else {
    P.from_greenwich = 0;
  }
}

function init_units(P) {
  var params = P.params;
  var name, s, units;
  if (name = pj_param(params, 'sunits')) {
    units = find_units(name);
    if (!units) {
      error(-7);
    }
    s = units.to_meter;
  }
  if (s || (s = pj_param(params, 'sto_meter'))) {
    P.to_meter = parse_to_meter(s);
    P.fr_meter = 1 / P.to_meter;
  } else {
    P.to_meter = P.fr_meter = 1;
  }

  // vertical units
  s = null;
  if (name = pj_param(params, 'svunits')) {
    units = find_units(name);
    if (!units) {
      error(-7);
    }
    s = units.to_meter;
  }
  if (s || (pj_param(params, 'svto_meter'))) {
    P.vto_meter = parse_to_meter(s);
    P.vfr_meter = 1 / P.vto_meter;
  } else {
    P.vto_meter = P.to_meter;
    P.vfr_meter = P.fr_meter;
  }
}

function parse_to_meter(s) {
  var parts = s.split('/');
  var val = pj_strtod(parts[0]);
  if (parts.length > 1) {
    val /= pj_strtod(parts[1]);
  }
  return val;
}

function init_axis(P) {
  var axis_legal = "ewnsud";
  var axis = pj_param(P.params, 'saxis');
  if (axis.length != 3) {
    error(PJD_ERR_AXIS);
  }
  if (axis_legal.indexOf(axis[0]) == -1 ||
      axis_legal.indexOf(axis[1]) == -1 ||
      axis_legal.indexOf(axis[2]) == -1) {
    error(PJD_ERR_AXIS);
  }
  P.axis = axis;
}

function is_wgs84(P) {
  return P.datum_type == PJD_3PARAM &&
    P.datum_params[0] == P.datum_params[1] == P.datum_params[2] === 0 &&
    P.a == 6378137 && Math.abs(P.es - 0.006694379990) < 0.000000000050;
}
