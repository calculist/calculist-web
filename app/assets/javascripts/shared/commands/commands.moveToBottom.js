calculist.register('commands.moveToBottom', ['_'], function (_) {

  return function (item) {
    _.pull(item.$parent.items, item);
    item.$parent.items.push(item);
    item.refreshSortOrder();
    item.$parent.renderChildren();
  }

});
