calculist.register('keyToVarName', [], function () {
  return function (key) { return key.replace(/\s/g, '_'); };
});
