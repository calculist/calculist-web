import $ from 'jquery';
import zoomPage from '../../client/ui/zoomPage';

const item_getLineWidthInCharacters = (function (zoomPage) {

  var FONT_SIZE = 16, TOP_ITEM_FONT_SIZE = 32;

  // Ruler creation deferred — only needed if getCharWidth is ever un-commented
  var ruler: any;
  var getRuler = function() {
    if (!ruler) {
      ruler = $('<span style="visibility: hidden;white-space:nowrap;"></span>');
      $('#main-container').append(ruler);
    }
    return ruler;
  };

  var getCharWidth = function (text: any, isTopLevel: boolean) {
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

})(zoomPage);

export default item_getLineWidthInCharacters;
