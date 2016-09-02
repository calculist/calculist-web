lm.register('item.getLineWidthInCharacters', ['_'], function (_) {

  var CHAR_WIDTH = 8, PADDING = 8, FUDGE = 32;

  return function () {
    this.$input || (this.$input = this.$('#input' + this.id));
    var inputWidth = this.$input.width(),
        isTopLevel = sessionStorage.zoomGuid === this.guid || !this.$parent,
        charWidth = isTopLevel ? (CHAR_WIDTH * 2) : CHAR_WIDTH,
        widthInCharacters = inputWidth / charWidth;

    return widthInCharacters;
  };

});
