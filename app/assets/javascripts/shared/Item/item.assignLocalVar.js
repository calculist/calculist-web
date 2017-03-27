calculist.register('item.assignLocalVar',['_'], function (_) {

  var possibleNames = ['$name','$background','$hidden'].reduce(function (nameObject, name) {
    nameObject[name] = name;
    return nameObject;
  }, {});

  return function(name, val) {
    var name = possibleNames[name];
    if (!name) return;
    if (name === '$name' && val != null && this.key !== val) {
      this.changeText(val + ' ' + this.parsedText.separator + this.parsedText.val);
    }
    this.localVars || (this.localVars = {});
    var prevVal = this.localVars[name];
    if (val === prevVal) return;
    this.localVars[name] = val;
    this.applyLocalStyle();
  };

});
