/* @requires pj_datums */

function pj_datum_set(P) {
  var SEC_TO_RAD = 4.84813681109535993589914102357e-6;
  var params = P.params;
  var name, datum, nadgrids, catalog, towgs84;

  P.datum_type = PJD_UNKNOWN;

  if (name = pj_param(params, 'sdatum')) {
    datum = find_datum(name);
    if (!datum) {
      error(-9);
    }
    if (datum.ellipse_id) {
      pj_mkparam(params, 'ellps=' + datum.ellipse_id);
    }
    if (datum.defn) {
      pj_mkparam(params, datum.defn);
    }
  }

  if (nadgrids = pj_param(params, "snadgrids")) {
    fatal("+nadgrids is not implemented");
  } else if (catalog = pj_param(params, "scatalog")) {
    fatal("+catalog is not implemented");
  } else if (towgs84 = pj_param(params, "stowgs84")) {
    P.datum_params = towgs84.split(',').map(pj_atof);
    if (P.datum_params.length == 7) {
      P.datum_type = PJD_7PARAM;
      P.datum_params[3] *= SEC_TO_RAD;
      P.datum_params[4] *= SEC_TO_RAD;
      P.datum_params[5] *= SEC_TO_RAD;
      P.datum_params[6] =  P.datum_params[6] / 1e6 + 1;
    } else {
      P.datum_type = PJD_3PARAM;
    }
  }
}
