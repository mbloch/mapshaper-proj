
var initcache = {};

function pj_search_initcache(key) {
  return initcache[key.toLowerCase()] || null;
}

function pj_insert_initcache(key, defn) {
  initcache[key.toLowerCase()] = defn;
}
