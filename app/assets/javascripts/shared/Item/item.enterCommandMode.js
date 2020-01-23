calculist.register('item.enterCommandMode', ['_','eventHub'], function (_, eventHub) {

  return function(startingText, cursorIndex, highlightWidth) {
    eventHub.trigger('item.enterCommandMode:before', this);
    if (this.mode === 'search') {
      this.mode = 'search:command';
      startingText || (startingText = 'for each ( $results ),');
    } else {
      this.mode = 'command';
    }
    var $input = this.$("#input" + this.id);
    $input.addClass('command').text(_.isString(startingText) ? startingText : '');
    if (startingText) {
      var range = document.createRange();
      var sel = window.getSelection();
      range.setStart($input[0].childNodes[0], startingText.length);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    eventHub.trigger('item.enterCommandMode', this);
  };

});
