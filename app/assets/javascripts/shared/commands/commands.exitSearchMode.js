calculist.register('commands.exitSearchMode', ['eventHub', 'zoomPage', 'itemOfFocus'], function (eventHub, zoomPage, itemOfFocus) {

  return function (_this) {
    _this.mode = null;
    _this.searchResults = null;
    // We reset the UI asynchronously in case the
    // search results are still rendering.
    // Rendering continually checks _this.mode and
    // aborts rendering if _this.mode !== 'search'.
    requestAnimationFrame(function () {
      var resetCollapsed = function (items) {
        return items.forEach(function (item) {
          item.$el.show();
          if (item.wasCollapsed) {
            item.wasCollapsed = false;
            item.collapsed = true;
          }
          resetCollapsed(item.items);
        });
      };
      resetCollapsed([_this]);
      $('#main-container').removeClass('search');
      zoomPage.getTopItem().render();
      var iof = itemOfFocus.get();
      iof && iof.focus();
    });
  };
});
