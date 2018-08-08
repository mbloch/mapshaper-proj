/**
 * Copyright 2018 Bernie Jenny, Monash University, Melbourne, Australia.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Equal Earth is a projection inspired by the Robinson projection, but unlike
 * the Robinson projection retains the relative size of areas. The projection
 * was designed in 2018 by Bojan Savric, Tom Patterson and Bernhard Jenny.
 *
 * Publication:
 * Bojan ?avri?, Tom Patterson & Bernhard Jenny (2018). The Equal Earth map
 * projection, International Journal of Geographical Information Science,
 * DOI: 10.1080/13658816.2018.1504949
 *
 * Code released August 2018
 * Ported to JavaScript and adapted for mapshaper-proj.js by Matthew Bloch August 2018
 */
pj_add(pj_eqearth, 'eqearth', 'Equal Earth', "\n\tPCyl., Sph.");

function pj_eqearth(P) {
  var A1 = 1.340264,
      A2 = -0.081106,
      A3 = 0.000893,
      A4 = 0.003796,
      M = Math.sqrt(3) / 2.0;

  P.es = 0;
  P.fwd = s_fwd;
  P.inv = s_inv;

  function s_fwd(lp, xy) {
    var paramLat = Math.asin(M * Math.sin(lp.phi));
    var paramLatSq = paramLat * paramLat;
    var paramLatPow6 = paramLatSq * paramLatSq * paramLatSq;
    xy.x = lp.lam * Math.cos(paramLat)
            / (M * (A1 + 3 * A2 * paramLatSq + paramLatPow6 * (7 * A3 + 9 * A4 * paramLatSq)));
    xy.y = paramLat * (A1 + A2 * paramLatSq + paramLatPow6 * (A3 + A4 * paramLatSq));
  }

  function s_inv(xy, lp) {
    var EPS = 1e-9,
        NITER = 12,
        paramLat = xy.y,
        paramLatSq, paramLatPow6, fy, fpy, dlat, i;

    for (i = 0; i < NITER; ++i) {
      paramLatSq = paramLat * paramLat;
      paramLatPow6 = paramLatSq * paramLatSq * paramLatSq;
      fy = paramLat * (A1 + A2 * paramLatSq + paramLatPow6 * (A3 + A4 * paramLatSq)) - xy.y;
      fpy = A1 + A2 * paramLatSq + paramLatPow6 * (A3 + A4 * paramLatSq);
      paramLat -= dlat = fy / fpy;
      if (Math.abs(dlat) < EPS) {
          break;
      }
    }
    paramLatSq = paramLat * paramLat;
    paramLatPow6 = paramLatSq * paramLatSq * paramLatSq;
    lp.lam = M * xy.x * (A1 + 3 * A2 * paramLatSq + paramLatPow6 * (7 * A3 + 9 * A4 * paramLatSq))
            / Math.cos(paramLat);
    lp.phi = Math.asin(Math.sin(paramLat) / M);
  }
}
