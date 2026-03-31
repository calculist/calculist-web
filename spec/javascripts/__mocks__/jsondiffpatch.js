var noop = function() {};
var jsondiffpatch = {
  create: function() { return { diff: noop }; },
  diff: noop,
  patch: noop,
};
module.exports = jsondiffpatch;
module.exports.default = jsondiffpatch;
module.exports.__esModule = true;
