
(function (global) {
    // FIXME Do proper lexical analysis.
  var ESCAPED_DOUBLE_QUOTES_PLACEHOLDER = "______adsfasdfrtrssgoivdfoijwpdfoijdfg_______";
  var ESCAPED_DOUBLE_QUOTES_PATTERN = new RegExp(ESCAPED_DOUBLE_QUOTES_PLACEHOLDER, 'g');
  var ESCAPED_SINGLE_QUOTES_PLACEHOLDER = "______oiwjefoijfviojdfhweoiufhoihsdfoi_______";
  var ESCAPED_SINGLE_QUOTES_PATTERN = new RegExp(ESCAPED_SINGLE_QUOTES_PLACEHOLDER, 'g');
  var isDigit = function (s) { return /\d/.test(s); };

  function evalculist (code, handlers) {
    var string = code.replace(/\\"/g , ESCAPED_DOUBLE_QUOTES_PLACEHOLDER)
    .replace(/\\'/g , ESCAPED_SINGLE_QUOTES_PLACEHOLDER)
    .split(/(".*?")/g).map(function (dqChunk) {
      return dqChunk.split(/('.*?')/g).map(function (sqChunk) {
        var isStr = sqChunk[0]  == '"' || sqChunk[0] == "'";
        return isStr ? sqChunk : sqChunk.replace(/[a-zA-Z\d_\$]+/g, function(a,b){return isDigit(a[0]) ? a : '_var("' + a + '")';});
      }).join('');
    }).join('')
    .replace(/_var\("((?:\w|\$)+)"\)\[(.+?)\]/g, function(s, variableName, attributeName) {
      return '_brk_acc(_var("' + variableName + '"), ' + attributeName + ')';
    })
    .replace(/_var\("((?:\w|\$)+)"\)\._var\("((?:\w|\$)+)"\)/g, function(s, variableName, attributeName) {
      return '_dot_acc(_var("' + variableName + '"), "' + attributeName + '")';
    })
    .replace(ESCAPED_DOUBLE_QUOTES_PATTERN, '\\"')
    .replace(ESCAPED_SINGLE_QUOTES_PATTERN, "\\'");

    handlers || (handlers = evalculist);
    if (handlers === true) return string;
    var fn = new Function('_var','_brk_acc','_dot_acc', "'use strict';return " + string + ";");
    var _var = handlers.variable;
    var _brk_acc =  handlers.bracketAccessor || handlers.accessor;
    var _dot_acc =  handlers.dotAccessor || handlers.accessor;
    return fn(_var, _brk_acc, _dot_acc);
  };

  evalculist.context = {};
  evalculist.variable = function (name) { return evalculist.context[name]; };
  evalculist.accessor = function (object, key) { return object[key]; };

  try {
    module.exports = evalculist;
  } catch (e) {
    global.evalculist = evalculist;
  }
})(this);
