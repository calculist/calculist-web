calculist.register('commands.enterSearchMode', ['eventHub', 'zoomPage'], function (eventHub, zoomPage) {
  return function (_this) {
    var f = _.debounce(function () {
      _this.mode = 'search';
      _this.$("#input" + _this.id).addClass('search').text('');
      var lowerOpacity = function (item) {
        if (item === _this) return;
        item.$(".input-container:first").css('opacity', '0.4');
        if (item.collapsed) return;
        item.items.forEach(lowerOpacity);
      };
      lowerOpacity(zoomPage.getTopItem());
      eventHub.trigger('item.enterSearchMode', _this);
    });
    if (_this.mode === 'command') {
      eventHub.once('item.exitCommandMode', f);
    } else {
      f();
    }
  };
});
