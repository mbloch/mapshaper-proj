
// TODO: translate between proj4 +axis and wkt AXIS parameters

// get array of AXIS attributes
// TODO: use this function; support non-standard axes
function wkt_get_axis(P) {
  var x = ['AXIS', 'Easting', 'EAST'];
  var y = ['AXIS', 'Northing', 'NORTH'];
  return [x, y];
}
