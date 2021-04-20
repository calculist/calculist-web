calculist.register('itemOfFocus', ['eventHub','itemOfDrag'], function (eventHub, itemOfDrag) {
  var previousItemOfFocus;
  var itemOfFocus;
  var api = {};
  api.change = function (item) {
    var dragItem = itemOfDrag.get();
    if (dragItem) item = dragItem;
    if (item === itemOfFocus) return;
    eventHub.trigger('itemOfFocusChange:before', itemOfFocus);
    previousItemOfFocus = itemOfFocus;
    itemOfFocus = item;
    eventHub.trigger('itemOfFocusChange', itemOfFocus);
  };
  eventHub.on('itemOfSearchChange', api.change);
  api.defocusAndCallout = function (item) {
    // TODO Make this a proper state.
    if (item !== itemOfFocus) return;
    eventHub.once('item.handleBlur', function () {
      item.$('#input' + item.id).addClass("callout focus");
    });
    item.$('#input' + item.id).blur();
    api.change(null);
    $(document).on('keyup', function (e) {
      if (previousItemOfFocus === item) previousItemOfFocus.handleFocus(e);
      $(this).off(e);
    });
  };
  api.get = function () { return itemOfFocus; };
  api.is = function (item) { return item === itemOfFocus; };

  return api;
});
