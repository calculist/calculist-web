calculist.register('item.assignLocalVar',['_'], function (_) {

  var possibleNames = ['$background','$hidden'].reduce(function (nameObject, name) {
    nameObject[name] = name;
    return nameObject;
  }, {});

  return function(name, val) {
    var name = possibleNames[name];
    if (!name) return;
    this.localVars || (this.localVars = {});
    var prevVal = this.localVars[name];
    if (val === prevVal) return;
    this.localVars[name] = val;
    this.applyLocalStyle();
  };

});
