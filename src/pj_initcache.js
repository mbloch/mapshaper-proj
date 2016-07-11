
var cache = {};

function pj_search_initcache(key) {
  return cache[key.toLowerCase()] || null;
}

function pj_insert_initcache(key, defn) {
  cache[key.toLowerCase()] = defn;
}
