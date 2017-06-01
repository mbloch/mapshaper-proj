
var pj_datums = [
  /* id defn ellipse_id comments */
  ["WGS84", "towgs84=0,0,0", "WGS84", "WGS_1984"], // added comment for wkt creation
  ["GGRS87", "towgs84=-199.87,74.79,246.62", "GRS80", "Greek_Geodetic_Reference_System_1987"],
  ["NAD83", "towgs84=0,0,0", "GRS80", "North_American_Datum_1983"],
  // nadgrids not supported; NAD27 will trigger an error
  ["NAD27", "nadgrids=@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat", "clrk66", "North_American_Datum_1927"],
  ["potsdam", "towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7", "bessel", "Potsdam Rauenberg 1950 DHDN"],
  ["carthage","towgs84=-263.0,6.0,431.0", "clrk80ign", "Carthage 1934 Tunisia"],
  ["hermannskogel", "towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232", "bessel", "Hermannskogel"],
  ["ire65", "towgs84=482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15", "mod_airy", "Ireland 1965"],
  ["nzgd49", "towgs84=59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993", "intl", "New Zealand Geodetic Datum 1949"],
  ["OSGB36", "towgs84=446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894", "airy", "OSGB 1936"],
  [null, null, null, null]
];


var pj_prime_meridians = [
  // id definition
  ["greenwich", "0dE"],
  ["lisbon",    "9d07'54.862\"W"],
  ["paris",     "2d20'14.025\"E"],
  ["bogota",    "74d04'51.3\"W"],
  ["madrid",    "3d41'16.58\"W"],
  ["rome",      "12d27'8.4\"E"],
  ["bern",      "7d26'22.5\"E"],
  ["jakarta",   "106d48'27.79\"E"],
  ["ferro",     "17d40'W"],
  ["brussels",  "4d22'4.71\"E"],
  ["stockholm", "18d3'29.8\"E"],
  ["athens",    "23d42'58.815\"E"],
  ["oslo",      "10d43'22.5\"E"],
  [null,        null]
];

function find_prime_meridian(id) {
  var defn = pj_prime_meridians.reduce(function(memo, arr) {
    return arr[0] === id ? arr : memo;
  }, null);
  return defn ? {id: defn[0], definition: defn[1]} : null;
}

function find_datum(id) {
  var defn = pj_datums.reduce(function(memo, arr) {
    return arr[0] === id ? arr : memo;
  }, null);
  return defn ? {id: defn[0], defn: defn[1], ellipse_id: defn[2], name: defn[3]} : null;
}
