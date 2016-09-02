lm.register('item.changeText', ['_','transaction'], function (_, transaction) {

  return function(newText) {
    transaction.debounced(_.noop);
    this.text = newText;
    this.save();
  };

});

lm.register('item.addText', [], function () {

  return function(newText) {
    return this.changeText(this.text + newText);
  };

});
