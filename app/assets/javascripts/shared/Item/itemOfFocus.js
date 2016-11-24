calculist.register('itemOfFocus', ['eventHub'], function (eventHub) {
  var itemOfFocus;
  return {
    change: function (item) {
      if (item === itemOfFocus) return;
      eventHub.trigger('itemOfFocusChange:before', itemOfFocus);
      itemOfFocus = item;
      eventHub.trigger('itemOfFocusChange', itemOfFocus);
    },
    get: function () { return itemOfFocus; },
    is: function (item) { return item === itemOfFocus; }
  }
})
