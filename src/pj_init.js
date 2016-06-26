/* @requires pj_param, pj_datum_set, pj_ell_set, pj_units */

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

  // TODO: implement +init
  if (pj_param(params, "tinit")) {
    fatal("+init argument not implemented");
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
    get_defaults(P, name);
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

// TODO: try to read a defaults file, like Proj.4 does
// see https://github.com/OSGeo/proj.4/blob/master/nad/proj_def.dat
function get_defaults(P, name) {
  P.ellps = "WGS84";
  if (name == 'aea') {
    P.lat_1 = 29.5;
    P.lat_2 = 45.5;
  } else if (name == 'lcc') {
    P.lat_1 = 33;
    P.lat_2 = 45;
  }
}
