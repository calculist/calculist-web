calculist.register('commands.copy', ['_','copyToClipboard','commands.copyItemsToClipboard','isItem'], function (_, copyToClipboard, copyItemsCommand, isItem) {
  return _.rest(function (_this, thingToCopy, options) {
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
