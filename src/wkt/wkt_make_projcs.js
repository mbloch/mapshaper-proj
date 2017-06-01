/* @requires wkt_make_geogcs */

function wkt_make_projcs(P) {
  return find_wkt_maker(P)(P);
}

function wkt_simple_projcs_maker(wktProjection, paramIds) {
  return wkt_projcs_maker({
    PROJECTION: wktProjection,
    PARAMETER: wkt_parameter_maker(paramIds)
  });
}

function wkt_projcs_maker(o) {
  return function(P) {
    var projcs = {
      // if o.NAME GEOGCS exists and returns falsy value, use default function
      GEOGCS: o.GEOGCS && o.GEOGCS(P) || wkt_make_geogcs(P),
      PROJECTION: wkt_is_string(o.PROJECTION) ? o.PROJECTION : o.PROJECTION(P),
      PARAMETER: o.PARAMETER(P),
      UNIT: wkt_make_unit(P)
    };
    // if o.NAME function exists and returns falsy value, use default name
    projcs.NAME = o.NAME && o.NAME(P, projcs) || wkt_make_default_projcs_name(P, projcs);
    return {PROJCS: projcs};
  };
}

// Get CS name from comment in +init source (if +init param is present)
function wkt_get_init_name(P) {
  var o;
  if (pj_param(P.params, 'tinit')) {
    o = pj_read_init_opts(pj_param(P.params, 'sinit'));
  }
  return o ? o.comment : '';
}

function wkt_make_default_projcs_name(P, projcs) {
  var initName = wkt_get_init_name(P);
  return initName || projcs.GEOGCS.NAME + ' / ' + projcs.PROJECTION;
}
