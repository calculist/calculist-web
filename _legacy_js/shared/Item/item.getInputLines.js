calculist.register('item.getInputLines', ['wordWrap'], function (wordWrap) {
  return function () {
    return this.inputLines || (
      this.inputLines = wordWrap.getLines(this.text, this.getLineWidthInCharacters())
    );
  };
});
