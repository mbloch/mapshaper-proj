
// add math.h functions to library scope
// (to make porting projection functions simpler)
var fabs = Math.abs,
    floor = Math.floor,
    sin = Math.sin,
    cos = Math.cos,
    tan = Math.tan,
    asin = Math.asin,
    acos = Math.acos,
    atan = Math.atan,
    atan2 = Math.atan2,
    sqrt = Math.sqrt,
    pow = Math.pow,
    exp = Math.exp,
    log = Math.log,
    hypot = Math.hypot,
    sinh = Math.sinh,
    cosh = Math.cosh,
    MIN = Math.min,
    MAX = Math.max;

// constants from math.h
var HUGE_VAL = Infinity,
    M_PI = Math.PI;

// from proj_api.h
var RAD_TO_DEG = 57.295779513082321,
    DEG_TO_RAD = 0.017453292519943296;

// from pj_transform.c
var SRS_WGS84_SEMIMAJOR = 6378137;
var SRS_WGS84_ESQUARED = 0.0066943799901413165;

// math constants from project.h
var M_FORTPI = M_PI / 4,
    M_HALFPI = M_PI / 2,
    M_PI_HALFPI = 1.5 * M_PI,
    M_TWOPI = 2 * M_PI,
    M_TWO_D_PI = 2 / M_PI,
    M_TWOPI_HALFPI = 2.5 * M_PI;

// datum types
var PJD_UNKNOWN = 0,
    PJD_3PARAM = 1,
    PJD_7PARAM = 2,
    PJD_GRIDSHIFT = 3,
    PJD_WGS84 = 4;

// named errors
var PJD_ERR_GEOCENTRIC = -45,
    PJD_ERR_AXIS = -47,
    PJD_ERR_GRID_AREA = -48,
    PJD_ERR_CATALOG = -49;

// common
var EPS10 = 1e-10;
