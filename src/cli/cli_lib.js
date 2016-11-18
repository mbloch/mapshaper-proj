// This Node module is used by scripts in the bin/ directory

var proj = require('../../');
var api = module.exports = {};

api.get_input_transform = function(translateLine, opts) {
  var commentChar = opts.t || '#';
  var files = opts._.length > 0 ? opts._ : null;

  return function(input) {
    var linesOut = [],
        linesIn, line, i;

    if (!input) {
      linesIn = api.read_lines(files);
    } else {
      linesIn = input.trim().split('\n');
    }
    for (i=0; i<linesIn.length; i++) {
      line = linesIn[i];
      if (line[0] == commentChar) continue;
      line = translateLine(line, i);
      if (line) {
        if (opts.E) {
          line = linesIn[i] + '\t' + line;
        }
        linesOut.push(line);
      }
    }
    return linesOut.join('\n');
  };
};

api.get_line_parser = function(is_latlong, opts) {
  var parseDMS = proj.internal.dmstod;
  return function(line) {
    var input = line.trim().split(/[\s]+/),
        coords;
    if (input.length < 2) return null;
    if (opts.r) {
      input = [input[1], input[0]];
    }
    if (is_latlong) {
      coords = [parseDMS(input[0]), parseDMS(input[1])];
    } else {
      coords = [+input[0], +input[1]];
    }
    coords[2] = input.length > 2 ? +input[2] : 0;
    return coords;
  };
};

api.get_line_formatter = function(is_latlong, opts) {
  var decimals = opts.w || opts.W ? parseInt(opts.w || opts.W) : 3;
  var fmtLat = proj.internal.get_dtodms(decimals, !!opts.W, 'N', 'S');
  var fmtLon = proj.internal.get_dtodms(decimals, !!opts.W, 'E', 'W');
  var defFmt = is_latlong ? '%.3f' : '%.2f';
  var fmtNum = api.get_dfmt(opts.f || defFmt);

  if (opts.f) {
    // decimal degree output if -f is set
    fmtLat = fmtLon = fmtNum;
  }

  return function(coords) {
    var oline, output;
    if (coords[0] == Infinity) {
      oline = opts.e || '*\t*';
    } else {
      if (is_latlong) {
        output = [fmtLon(coords[0]), fmtLat(coords[1])];
      } else {
        output = [fmtNum(coords[0]), fmtNum(coords[1])];
      }
      if (opts.s) {
        output = [output[1], output[0]];
      }
      oline = output.join('\t');
    }
    if (coords.length > 2) {
      oline += ' ' + fmtNum(coords[2]);
    }
    return oline;
  };
};

api.get_shared_options = function() {
  return require('./parse_args.js')()
    .option('I', {
      type: 'flag'
    })
    .option('t', {
      type: 'inline_char'
    })
    .option('e', {
      type: 'string'
    })
    .option('E', {
      type: 'flag'
    })
    .option('l', {
      type: 'inline_string'
    })
    .option('r', {
      type: 'flag'
    })
    .option('s', {
      type: 'flag'
    })
    .option('f', {
      type: 'string'
    })
    .option('w', {
      type: 'inline_char'
    })
    .option('W', {
      type: 'inline_char'
    });
};

// @arg string following the "-l" flag
api.get_info = function(arg) {
  var msg;
  if (!arg || arg == 'p' || arg == 'P') {
    msg = get_proj_info(null, arg == 'P');
  } else if (arg[0] == '=') {
    msg = get_proj_info(arg.substr(1), true);
  } else if (arg == 'e') {
    msg = get_ellps_info();
  } else if (arg == 'd') {
    msg = get_datum_info();
  } else if (arg == 'u') {
    msg = get_units_info();
  } else {
    error("invalid list option: l" + arg);
  }
  return msg || '';
};

api.read_lines = function(files) {
  var rw = require('rw');
  var lines = [];
  if (!files) files = ['-'];
  files.forEach(function(file) {
    var contents;
    if (file == '-') file = '/dev/stdin';
    try {
      contents = rw.readFileSync(file, 'utf8').trim();
      lines = lines.concat(contents.split('\n')); // TODO: handle CRLF
    } catch(e) {
      error("unable to read from " + file);
    }
  });
  return lines;
};

api.get_dfmt = function(fmt) {
  // http://www.gnu.org/software/libc/manual/html_node/Floating_002dPoint-Conversions.html
  // TODO: support " " and "#" flags and type g/G
  var match = /^%([0+-]*)([0-9]*)\.?([0-9]*)([fe])$/i.exec(fmt.trim());
  if (!match) {
    error("unsupported format: " + fmt);
  }
  var type = match[4].toLowerCase(),
      uc = type != match[4],
      flags = match[1],
      width = parseInt(match[2]),
      decimals = match[3].length > 0 ? parseInt(match[3]) : 6,
      leftAlign = flags.indexOf('-') > -1,
      zeroPad = flags.indexOf('0') > -1,
      showPos = flags.indexOf('+') > -1,
      formatter = get_num_formatter(type, decimals);

  return function(val) {
    // TODO: handle Infinity and -Infinity
    var str;
    if (isNaN(val)) {
      str = 'nan';
    } else {
      str = formatter(val);
      if (showPos && /^[0-9]/.test(str)) {
        str = '+' + str;
      }
      if (width > str.length) {
        if (leftAlign) {
          str = right_pad(str, width - str.length, ' ');
        } else {
          str = left_pad(str, width - str.length, zeroPad ? '0' : ' ');
        }
      }
    }
    if (uc) {
      str = str.toUpperCase();
    }
    return str;
  };
};

function right_pad(str, chars, padChar) {
  while (chars-- > 0) str += padChar;
  return str;
}

function left_pad(str, chars, padChar) {
  var c = str[0],
      hasSign = c == '-' || c == '+';
  if (hasSign) {
    str = str.substr(1);
  }
  while (chars-- > 0) str = padChar + str;
  if (hasSign) {
    str = c + str;
  }
  return str;
}

function get_num_formatter(type, decimals) {
  return function(val) {
    var str = '';
    if (type == 'f') {
      str = val.toFixed(decimals | 0);
    } else if (type == 'e') {
      str = decimals ? val.toExponential(decimals) : val.toExponential();
    }
    return str;
  };
}

function error(msg) {
  throw new Error(msg || 'an unknown error occurred');
}

function get_ellps_info() {
  return proj.internal.pj_datums.map(function(arr) {
      if (!arr[0]) return '';
      return arr[0] + '\t' + arr[2] + '\t' + arr[1] + '\t' + arr[2];
    }).join('\n').trim();
}

function get_units_info() {
  return proj.internal.pj_units.map(function(arr) {
    if (!arr[0]) return '';
    return arr[0] + '\t' + arr[1] + '\t' + arr[2];
    }).join('\n').trim();
}

function get_datum_info() {
  return 'datum\tellipse\tdefinition\n' +
    proj.internal.pj_datums.map(function(arr) {
      return arr[0] + '\t' + arr[2] + '\t' + arr[1];
    }).join('\n');
}

function get_proj_info(name, ext) {
  var pj_list = proj.internal.pj_list;
  var keys = Object.keys(pj_list).filter(function(key) {
    return name ? key == name :
      key != 'geocent' && key != 'longlat' && key != 'latlong';
  }).sort();
  return keys.map(function(key) {
    var defn = pj_list[key],
        str = key + ' : ' + defn.name;
    if (name || ext) {
      str += defn.description;
    }
    return str;
  }).join('\n');
}
