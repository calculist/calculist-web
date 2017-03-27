calculist.register('item.changeText', ['_','transaction','eventHub','parseItemText'], function (_, transaction, eventHub, parseItemText) {

  return function(newText) {
    if (this.text === newText) return;
    eventHub.trigger('item.changeText:before', this);
    transaction.debounced(_.noop);
    this.text = newText;
    var prevKey = this.key;
    this.evalFn = null;
    this.parseItemText = parseItemText(this.text);
    this.key = this.parseItemText.key;
    if (this.key !== prevKey) eventHub.trigger('keychange', prevKey, this.key);
    this.save();
    eventHub.trigger('item.changeText', this);
  };

});

calculist.register('item.addText', [], function () {

  return function(newText) {
    return this.changeText(this.text + newText);
  };

});
