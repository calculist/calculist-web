lm.register('isCollapsed', ['lmSessionStorage'], function (lmSessionStorage) {

  var values = {};
  // TODO Start using this service instead of the object attribute, which will
  // become depricated at some point
  var isCollapsed = function (guid, value) {
    if (value === true || value === false) {
      values[guid] = value;
    } else if (value[guid] == null) {
      values[guid] = true;
    }
    return values[guid];
  };

  return isCollapsed;

});
