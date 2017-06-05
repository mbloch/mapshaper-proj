/* evaluate complex polynomial */

/* note: coefficients are always from C_1 to C_n
**  i.e. C_0 == (0., 0)
**  n should always be >= 1 though no checks are made
*/
// z: Complex number (object with r and i properties)
// C: Array of complex numbers
// returns: complex number
function pj_zpoly1(z, C) {
  var t, r, i;
  var n = C.length - 1;
  r = C[n][0];
  i = C[n][1];
  while (--n >= 0) {
    t = r;
    r = C[n][0] + z.r * t - z.i * i;
    i = C[n][1] + z.r * i + z.i * t;
  }
  return {
    r: z.r * r - z.i * i,
    i: z.r * i + z.i * r
  };
}

/* evaluate complex polynomial and derivative */
function pj_zpolyd1(z, C, der) {
  var ai, ar, bi, br, t;
  var first = true;
  var n = C.length - 1;
  ar = br = C[n][0];
  ai = bi = C[n][1];
  while (--n >= 0) {
    if (first) {
      first = false;
    } else {
      br = ar + z.r * (t = br) - z.i * bi;
      bi = ai + z.r * bi + z.i * t;
    }
    ar = C[n][0] + z.r * (t = ar) - z.i * ai;
    ai = C[n][1] + z.r * ai + z.i * t;
  }
  der.r = ar + z.r * br - z.i * bi;
  der.i = ai + z.r * bi + z.i * br;
  return {
    r: z.r * ar - z.i * ai,
    i: z.r * ai + z.i * ar
  };
}
