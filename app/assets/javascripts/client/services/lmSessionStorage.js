calculist.register('lmSessionStorage', ['_'], function (_) {

  var allowedKeys = ['zoomGuid','focusGuid'];

  var throwIfNotAllowed = function (key) {
    if(!_.includes(allowedKeys, key)) throw new Error('"' + key + '" is not a valid lmSessionStorage key.');
    return key;
  };

  return Object.freeze({
    set: function (key, val) {
      sessionStorage[throwIfNotAllowed(key)] = '' + val;
    },
    get: _.flow(throwIfNotAllowed, _.propertyOf(sessionStorage))
  });
});
