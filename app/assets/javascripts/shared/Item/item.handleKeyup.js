calculist.register('item.handleKeyup', ['cursorPosition','itemOfFocus'], function (cursorPosition, itemOfFocus) {

  return function(e) {
    if (this.mode === 'command' || this.mode === 'search:command' || !itemOfFocus.is(this)) return;
    if (this.mode === 'search') {
      this.renderSearchResults(e.target.textContent);
      return;
    }
    var previousText = this.text;
    var text = e.target.textContent;
    if (text !== previousText) {
      this.changeText(text);
      this.save();
      this.valueOf();
      this.softRenderAll();
    }
    if (this.justFocused) {
      this.justFocused = false;
    } else {
      cursorPosition.set(this.text, this.depth);
    }
  };

});
