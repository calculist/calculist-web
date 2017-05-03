calculist.register('itemOfFocus', ['eventHub','itemOfDrag'], function (eventHub, itemOfDrag) {
  var itemOfFocus;
  return {
    change: function (item) {
      var dragItem = itemOfDrag.get();
      if (dragItem) item = dragItem;
      if (item === itemOfFocus) return;
      eventHub.trigger('itemOfFocusChange:before', itemOfFocus);
      itemOfFocus = item;
      eventHub.trigger('itemOfFocusChange', itemOfFocus);
    },
    get: function () { return itemOfFocus; },
    is: function (item) { return item === itemOfFocus; }
  }
});
