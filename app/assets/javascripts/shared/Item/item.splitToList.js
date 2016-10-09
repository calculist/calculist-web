calculist.register('item.splitToList', ['_','getNewGuid'], function (_, getNewGuid) {
  return function (splitter, replacer) {
    replacer || (replacer = '');
    var splitText = this.text.split(splitter),
        Item = this.constructor;
    if (!_.last(splitText)) splitText.pop();
    if (splitText.length < 2) return;
    this.text = splitText.shift() + replacer;
    _.reduce(splitText, function (previousSibling, text) {
      var item = new Item({
        text: text + replacer,
        $parent: previousSibling.$parent,
        guid: getNewGuid(),
        $items: []
      });
      item.$parent.insertAfter(item, previousSibling);
      item.refreshSortOrder();
      return item;
    }, this);
  };
});
