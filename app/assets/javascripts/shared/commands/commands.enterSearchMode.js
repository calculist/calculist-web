calculist.register('commands.enterSearchMode', ['eventHub', 'zoomPage'], function (eventHub, zoomPage) {
  return function (_this, query) {
    var f = _.debounce(function () {
      _this.mode = 'search';
      _this.$el.addClass('search');
      var text = (query || '').toString();
      _this.$("#input" + _this.id).addClass('search').text(text);
      if (_this.collapsed) {
        _this.wasCollapsed = true;
        _this.collapsed = false;
        _this.renderChildren();
      }
      var lowerOpacity = function (item) {
        if (item === _this) return;
        item.$(".input-container:first").css('opacity', '0.4');
        if (item.collapsed) return;
        item.items.forEach(lowerOpacity);
      };
      lowerOpacity(zoomPage.getTopItem());
      $('#main-container').addClass('search');
      eventHub.trigger('item.enterSearchMode', _this);
      _this.renderSearchResults(query);
    });
    if (_this.mode === 'command' || _this.mode === 'search:command') {
      eventHub.once('item.exitCommandMode', f);
    } else {
      f();
    }
  };
});
