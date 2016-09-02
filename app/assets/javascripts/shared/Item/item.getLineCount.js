lm.register('item.getLineCount', [], function () {

  return function () {
    this.$input || (this.$input = this.$('#input' + this.id));
    var inputHeight = this.$input.height(),
        isTopLevel = sessionStorage.zoomGuid === this.guid || !this.$parent,
        singleLineHeight = isTopLevel ? 32 : 16,
        lineCount = inputHeight / singleLineHeight;

    return lineCount;
  };

});
