function wkt_error(msg) {
  throw new Error(msg);
}

function wkt_warn(msg) {
  // TODO: consider option to inhibit logging
  //       consider strict mode to throw error
  console.error(msg);
}