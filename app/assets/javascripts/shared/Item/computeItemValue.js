calculist.register('computeItemValue', ['_','createComputationContextObject','evalculist','findVar'], function (_, createComputationContextObject, evalculist, findVar) {

  'use strict';

  return function (string, item, args) {

    string = string.replace(/\^item/g, function() {
      return '$$item';
    }).replace(/\*item/g, function () {
      return 'global_item';
    }).replace(/\$siblings/g, function() {
      return '$siblings()';
    });

    try {
      if (item.isComputingValue) throw 'infinite loop';
      item.isComputingValue = true;
      var valueContext, variables;
      var val = evalculist(string, {
        variable: function (v) {
          if (!variables) variables = {};
          if (variables[v] == null) {
            variables[v] = (args && args[v] != null) ? args[v] : findVar(item, v);
            // console.log(v, variables[v]);
          }
          if (variables[v] != null) return variables[v];
          if (!valueContext) valueContext = createComputationContextObject(item);
          return valueContext[v];
        },
        accessor: function (obj, attr) {
          if (!valueContext) valueContext = createComputationContextObject(item);
          return valueContext.accessor(obj, attr);
        },
        dotAccessor: function (obj, attr) {
          if (!valueContext) valueContext = createComputationContextObject(item);
          return valueContext.dotAccessor(obj, attr);
        }
      });
      item.isComputingValue = false;
      if (val == null) {
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
