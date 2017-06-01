/* @requires wkt_add */

add_simple_wkt_maker('vandg', 'VanDerGrinten');
add_wkt_parser(
  get_simple_parser_test('VanDerGrinten,Van_der_Grinten_I'),
  wkt_projcs_converter({
    PROJECTION: wkt_simple_projection_converter('vandg'),
    PARAMETER: function(P) {
      var params = wkt_parameter_converter('')(P);
      if (params) params += ' ';
      return params + '+R_A';
    }
  })
);
