
var pj_list = {};

function pj_add(func, key, name, desc) {
  pj_list[key] = {
    init: func,
    name: name,
    description: desc
  };
}
