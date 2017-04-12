calculist.require(['Item', 'cursorPosition','isReadOnly','itemOfFocus','itemOfDrag'], function (Item, cursorPosition, isReadOnly, itemOfFocus, itemOfDrag) {

  Item.prototype.handleFocus = function(e) {
    var dragItem = itemOfDrag.get();
    if (dragItem && itemOfDrag !== this) return e.preventDefault();
    itemOfFocus.change(this);
    sessionStorage.focusGuid = this.guid;
    if (isReadOnly()) return;
    this.showTrueValue();
    this.showComputedValue();
    var $input = this.$("#input" + this.id);
    $input.addClass('focus');
    // $input[0].selectionStart = cursorPosition.get();
    // $input[0].selectionEnd = 0;
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart($input[0].childNodes[0], Math.min(cursorPosition.get(this.depth), this.text.length));
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    this.justFocused = true;
    if ($input[0].scrollIntoViewIfNeeded) $input[0].scrollIntoViewIfNeeded();
  };

});
