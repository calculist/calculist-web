calculist.register('commands.copy', ['_','copyToClipboard','commands.copyItemsToClipboard','isItem'], function (_, copyToClipboard, copyItemsCommand, isItem) {
  return _.rest(function (_this, thingToCopy, options) {
    if (thingToCopy == null) thingToCopy = _this;
    if (isItem(thingToCopy)) {
      thingToCopy = [thingToCopy];
    }
    if (_.isArray(thingToCopy) && isItem(thingToCopy[0])) {
      copyItemsCommand({ items: thingToCopy, focus: _.noop }, options);
    } else {
      copyToClipboard('' + thingToCopy);
    }
  });
});

calculist.register('commands.copyItems', ['commands.copy'], function (copyCommand) {
  return function (_this, options) {
    return copyCommand(_this, _this.items, options);
  };
});

calculist.register('commands.cut', ['_', 'commands.copy', 'isItem'], function (_, copyCommand, isItem) {
  return function (_this, thingToCut, options) {
    copyCommand.apply(this, arguments);
    if (thingToCut == null || isItem(thingToCut)) return (thingToCut || _this).deleteItem(true);
    if (_.isArray(thingToCut) && isItem(thingToCut[0])) {
      thingToCut.forEach(function (item) { item.deleteItem(true); });
    }
  };
});
