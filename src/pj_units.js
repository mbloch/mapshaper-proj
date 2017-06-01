
var pj_units = [
  // id to_meter name
  ["km", "1000", "Kilometer"],
  ["m", "1", "Meter"],
  ["dm", "1/10", "Decimeter"],
  ["cm", "1/100", "Centimeter"],
  ["mm", "1/1000", "Millimeter"],
  ["kmi", "1852.0", "International Nautical Mile"],
  ["in", "0.0254", "International Inch"],
  ["ft", "0.3048", "International Foot"],
  ["yd", "0.9144", "International Yard"],
  ["mi", "1609.344", "International Statute Mile"],
  ["fath", "1.8288", "International Fathom"],
  ["ch", "20.1168", "International Chain"],
  ["link", "0.201168", "International Link"],
  ["us-in", "1/39.37", "U.S. Surveyor's Inch"],
  ["us-ft", "0.304800609601219", "U.S. Surveyor's Foot"],
  ["us-yd", "0.914401828803658", "U.S. Surveyor's Yard"],
  ["us-ch", "20.11684023368047", "U.S. Surveyor's Chain"],
  ["us-mi", "1609.347218694437", "U.S. Surveyor's Statute Mile"],
  ["ind-yd", "0.91439523", "Indian Yard"],
  ["ind-ft", "0.30479841", "Indian Foot"],
  ["ind-ch", "20.11669506", "Indian Chain"],
  [null, null, null]
];

function find_units_by_value(val) {
  return pj_units.reduce(function(memo, defn) {
    if (val == +defn[1]) {
      memo = find_units(defn[0]);
    }
    return memo;
  }, null);
}

function find_units(id) {
  var arr = pj_units.reduce(function(memo, defn) {
    return id === defn[0] ? defn : memo;
  }, null);
  return arr ? {id: arr[0], to_meter: arr[1], name: arr[2]} : null;
}
