var PJ_LOG_NONE = 0,
    PJ_LOG_ERROR = 1,
    PJ_LOG_DEBUG_MAJOR = 2,
    PJ_LOG_DEBUG_MINOR = 3;

// context of currently running projection function
// (Unlike Proj.4, we use a single ctx object)
var ctx = {
  last_errno: 0,
  debug_level:  PJ_LOG_NONE,
  logger: null // TODO: implement
};
