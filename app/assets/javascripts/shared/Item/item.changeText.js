calculist.register('item.changeText', ['_','transaction'], function (_, transaction) {

  return function(newText) {
    transaction.debounced(_.noop);
    this.text = newText;
    this.save();
  };

});

calculist.register('item.addText', [], function () {

  return function(newText) {
    return this.changeText(this.text + newText);
  };

});
