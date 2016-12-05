calculist.register('item.changeText', ['_','transaction','eventHub'], function (_, transaction, eventHub) {

  return function(newText) {
    eventHub.trigger('item.changeText:before', this);
    transaction.debounced(_.noop);
    this.text = newText;
    this.save();
    eventHub.trigger('item.changeText', this);
  };

});

calculist.register('item.addText', [], function () {

  return function(newText) {
    return this.changeText(this.text + newText);
  };

});
