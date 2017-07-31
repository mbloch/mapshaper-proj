/* @requires pj_datums */

function pj_datum_set(P) {
  var SEC_TO_RAD = 4.84813681109535993589914102357e-6;
  var params = P.datum_params = [0,0,0,0,0,0,0];
  var name, datum, nadgrids, catalog, towgs84;

  P.datum_type = PJD_UNKNOWN;

  if (name = pj_param(P.params, 'sdatum')) {
    datum = find_datum(name);
    if (!datum) {
      error(-9);
    }
    if (datum.ellipse_id) {
      pj_mkparam(P.params, 'ellps=' + datum.ellipse_id);
    }
    if (datum.defn) {
      pj_mkparam(P.params, datum.defn);
    }
  }

  nadgrids = pj_param(P.params, "snadgrids");
  if (nadgrids && nadgrids != '@null') {
    fatal("+nadgrids is not implemented");
  }
  if (catalog = pj_param(P.params, "scatalog")) {
    fatal("+catalog is not implemented");
  }
  if (towgs84 = pj_param(P.params, "stowgs84")) {
    towgs84.split(',').forEach(function(s, i) {
      params[i] = pj_atof(s) || 0;
    });
    if (params[3] != 0 || params[4] != 0 || params[5] != 0 || params[6] != 0) {
      P.datum_type = PJD_7PARAM;
      params[3] *= SEC_TO_RAD;
      params[4] *= SEC_TO_RAD;
      params[5] *= SEC_TO_RAD;
      params[6] =  params[6] / 1e6 + 1;
    } else {
      P.datum_type = PJD_3PARAM;
      /* Note that pj_init() will later switch datum_type to
         PJD_WGS84 if shifts are all zero, and ellipsoid is WGS84 or GRS80 */
    }
  }
}
