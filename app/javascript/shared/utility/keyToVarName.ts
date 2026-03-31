const keyToVarName = (function () {
  return function (key) { return key.replace(/\s/g, '_'); };
})();

export default keyToVarName;
