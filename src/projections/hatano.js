pj_add(pj_hatano, 'hatano', 'Hatano Asymmetrical Equal Area', '\n\tPCyl., Sph.');

function pj_hatano(P) {
  var NITER = 20;
  var EPS = 1e-7;
  var ONETOL = 1.000001;
  var CN = 2.67595;
  var CS = 2.43763;
  var RCN = 0.37369906014686373063;
  var RCS = 0.41023453108141924738;
  var FYCN = 1.75859;
  var FYCS = 1.93052;
  var RYCN = 0.56863737426006061674;
  var RYCS = 0.51799515156538134803;
  var FXC = 0.85;
  var RXC = 1.17647058823529411764;

  P.inv = s_inv;
  P.fwd = s_fwd;
  P.es = 0;

  function s_fwd(lp, xy) {
    var th1, c;
    var i;
    c = sin(lp.phi) * (lp.phi < 0 ? CS : CN);
    for (i = NITER; i; --i) {
      lp.phi -= th1 = (lp.phi + sin(lp.phi) - c) / (1 + cos(lp.phi));
      if (fabs(th1) < EPS) break;
    }
    xy.x = FXC * lp.lam * cos(lp.phi *= 0.5);
    xy.y = sin(lp.phi) * (lp.phi < 0 ? FYCS : FYCN);
  }

  function s_inv(xy, lp) {
    var th = xy.y * (xy.y < 0 ? RYCS : RYCN);
    if (fabs(th) > 1) {
      if (fabs(th) > ONETOL) {
        i_error();
      } else {
        th = th > 0 ? M_HALFPI : -M_HALFPI;
      }
    } else {
      th = asin(th);
    }

    lp.lam = RXC * xy.x / cos(th);
    th += th;
    lp.phi = (th + sin(th)) * (xy.y < 0 ? RCS : RCN);
    if (fabs(lp.phi) > 1) {
      if (fabs(lp.phi) > ONETOL) {
        i_error();
      } else {
        lp.phi = lp.phi > 0 ? M_HALFPI : -M_HALFPI;
      }
    } else {
      lp.phi = asin(lp.phi);
    }
  }
}
