import wordWrap from '../utility/wordWrap';

const item_getInputLines = (function (wordWrap) {
  return function () {
    return this.inputLines || (
      this.inputLines = wordWrap.getLines(this.text, this.getLineWidthInCharacters())
    );
  };
})(wordWrap);

export default item_getInputLines;
