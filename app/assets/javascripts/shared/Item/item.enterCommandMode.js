calculist.register('item.enterCommandMode', ['_','eventHub'], function (_, eventHub) {

  return function(startingText, cursorIndex, highlightWidth) {
    eventHub.trigger('item.enterCommandMode:before', this);
    this.mode = 'command';
    this.$("#input" + this.id).addClass('command').text(_.isString(startingText) ? startingText : '');
    eventHub.trigger('item.enterCommandMode', this);
  };

});
