calculist.register('item.getInputLines', ['wordWrap'], function (wordWrap) {
  return function () {
    return wordWrap.getLines(this.text, this.getLineWidthInCharacters());
  };
});
