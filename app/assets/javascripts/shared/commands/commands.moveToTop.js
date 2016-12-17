calculist.register('commands.moveToTop', ['_'], function (_) {

  return function (item) {
    _.pull(item.parent.items, item);
    item.parent.items.unshift(item);
    item.refreshSortOrder();
    item.parent.renderChildren();
  }

});
