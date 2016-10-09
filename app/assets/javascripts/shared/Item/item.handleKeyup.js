calculist.register('item.handleKeyup',['cursorPosition','commandTypeahead'], function (cursorPosition, commandTypeahead) {

  return function(e) {
    var previousText, previousVal, text;
    previousText = this.text;
    text = e.target.textContent;
    if (text !== previousText && this.mode !== 'command') {
      this.changeText(text);
    }
    if (text !== previousText || this.shouldSoftRender) {
      this.save();
      previousVal = this.val;
      this.valueOf();
      this.softRenderAll();
      this.shouldSoftRender = false;
    }
    if (this.justFocused) {
      this.justFocused = false;
    } else {
      cursorPosition.set(this.text, this.depth);
    }
  };

});
