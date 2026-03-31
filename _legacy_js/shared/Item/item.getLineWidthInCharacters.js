calculist.register('item.getLineWidthInCharacters', ['zoomPage'], function (zoomPage) {

  var FONT_SIZE = 16, TOP_ITEM_FONT_SIZE = 32;

  var ruler = $('<span style="visibility: hidden;white-space:nowrap;"></span>');

  $('#main-container').append(ruler);

  var getCharWidth = function (text, isTopLevel) {
    // FIXME
    return isTopLevel ? 16 : 8;
    // text || (text = '.'); // Need at least one character
    // ruler.css({
    //   fontSize: isTopLevel ? TOP_ITEM_FONT_SIZE : FONT_SIZE
    // }).text(text);
    // return ruler.width() / text.length;
  }

  return function () {
    var $input = this.$('#input' + this.id);
    var inputWidth = $input.width(),
        charWidth = getCharWidth(this.text, zoomPage.isTopOfAPage(this)),
        widthInCharacters = inputWidth / charWidth;

    return widthInCharacters;
  };

});
