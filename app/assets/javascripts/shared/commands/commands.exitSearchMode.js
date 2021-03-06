calculist.register('commands.exitSearchMode', ['eventHub', 'zoomPage', 'itemOfFocus', 'itemOfSearch'], function (eventHub, zoomPage, itemOfFocus, itemOfSearch) {

  return function (_this) {
    eventHub.trigger('exitSearchMode:before', _this);
    _this.mode = null;
    _this.searchResults = null;
    itemOfSearch.change(null);
    eventHub.trigger('exitSearchMode', _this);
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
      _this.$el.removeClass('search');
      $('#main-container').removeClass('search');
      zoomPage.getTopItem().render();
      var iof = itemOfFocus.get();
      iof && iof.focus();
      eventHub.trigger('exitSearchMode:after', _this);
    });
  };
});
