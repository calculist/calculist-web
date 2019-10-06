calculist.register('commands.exitSearchMode', ['eventHub', 'zoomPage', 'itemOfFocus'], function (eventHub, zoomPage, itemOfFocus) {

  return function (_this) {
    var resetCollapsed = function (items) {
      return items.forEach(function (item) {
        item.$el.show();
        if (item.wasCollapsed) {
          item.wasCollapsed = false;
          item.collapsed = true;
          // item.render();
        }
        resetCollapsed(item.items);
      });
    };
    _this.mode = null;
    resetCollapsed([_this]);
    _this.searchResults = null;
    zoomPage.getTopItem().render();
    var iof = itemOfFocus.get();
    iof && iof.focus();
  };
});
