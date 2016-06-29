// Parse options like the Proj.4 command line programs

module.exports = function() {
  return new Parser();
};

function Parser() {
  var defs = {};

  // @name (e.g. "l" "w")
  // @obj {}
  //   "type" (required) possible values: inline_string inline_char string flag
  //
  this.option = function(name, obj) {
    defs[name] = obj;
    return this;
  };

  this.parse = function(params) {
    if (typeof params == 'string') {
      params = params.trim().split(/[\s]+/);
    }
    return parseArgs(params, defs);
  };
}

function parseArgs(argv, defs) {
  var expect = [];
  var projArgs = [];
  var opts = {_:[]};
  argv.forEach(function(arg) {
    var c = arg[0];
    if (c == '-') {
      parseOpt(arg);
    } else if (c == '+') {
      projArgs.push(arg);
    } else if (expect.length > 0) {
      opts[expect.shift()] = arg;
    } else {
      opts._.push(arg);
    }
  });
  if (projArgs.length > 0) {
    opts.proj4 = projArgs.join(' ');
  }
  return opts;

  function parseOpt(arg) {
    var i = 1;
    var c, def;
    while (i < arg.length) {
      c = arg.charAt(i++);
      if (c in defs) {
        def = defs[c];
        if (def.type == 'flag') {
          opts[c] = true;
        } else if (def.type == 'string') {
          expect.push(c);
        } else if (def.type == 'inline_char') {
          opts[c] = arg.charAt(i);
          i++;
        } else if (def.type == 'inline_string') {
          opts[c] = arg.substr(i);
          break;
        }
      } else {
        console.error("Unsupported option: " + c);
        process.exit(1);
      }
    }
  }
}
