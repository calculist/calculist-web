lm.register('computeItemValue', ['_','createComputationContextObject','cParse','item.findVar'], function (_, createComputationContextObject, cParse, findVar) {

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
      var val = cParse(string, {
        variable: function (v) {
          if (!variables) variables = {};
          if (variables[v] == null) {
            variables[v] = (args && args[v] != null) ? args[v] : findVar.call(item, v);
            // console.log(v, variables[v]);
          }
          if (variables[v] != null) return variables[v];
          if (!valueContext) valueContext = createComputationContextObject(item);
          return valueContext[v];
        },
        accessor: function (obj, attr) {
          if (!valueContext) valueContext = createComputationContextObject(item);
          return valueContext.accessor(obj, attr);
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
