calculist.register('computeItemValue', ['_','createComputationContextObject','evalculist','findVar'], function (_, createComputationContextObject, evalculist, findVar) {

  'use strict';

  var preProcessString = function (string) {
    return string.replace(/\^item/g, function() {
      return '$$item';
    }).replace(/\*item/g, function () {
      return 'global_item';
    }).replace(/\@item/g, function () {
      return 'itemByGuid';
    }).replace(/\$siblings/g, function() {
      return '$siblings()';
    });
  };

  return function (string, item, args, isForCommand) {

    string = preProcessString(string);
    // string = string.replace('@content', '_toText($items)');
    // string = string.replace('@', '$');

    try {
      if (item.isComputingValue) throw 'infinite loop';
      item.isComputingValue = true;
      var valueContext, variables;
      var evalFn = isForCommand ? evalculist(string) : (item.evalFn || (item.evalFn = evalculist(string)));
      var val = evalFn({
        variable: function (v) {
          isForCommand || (item.hasVariableReference = true);
          if (!variables) variables = {};
          if (!variables.hasOwnProperty(v)) {
            variables[v] = (args && args.hasOwnProperty(v)) ? args[v] : findVar(item, v);
          }
          if (variables.hasOwnProperty(v) && variables[v] != null) return variables[v];
          if (!valueContext) valueContext = createComputationContextObject(item);
          return valueContext[v];
        },
        accessor: function (obj, attr) {
          if (!valueContext) valueContext = createComputationContextObject(item);
          return valueContext.accessor(obj, attr);
        },
        dotAccessor: function (obj, attr) {
          if (!valueContext) valueContext = createComputationContextObject(item);
          var val = valueContext.dotAccessor(obj, attr);
          if (val === item) return NaN;
          return val;
        },
        assignment: function (name, val) {
          isForCommand || (item.hasVariableReference = true);
          item.assignLocalVar(name, val);
          if (!variables) variables = {};
          return variables[name] = val;
        }
      });
      item.isComputingValue = false;
      if (val == null || val === item) {
        return NaN;
      } else if (_.isArray(val)) {
        return val;
      } else {
        return _.isNaN(+val) ? val : +val;
      }
    } catch (e) {
      item.isComputingValue = false;
      return NaN;
    }

  };
});
