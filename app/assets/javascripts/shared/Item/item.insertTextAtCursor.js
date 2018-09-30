calculist.require(['Item','_','parseTextDoc','getNewGuid','transaction','cursorPosition','itemOfFocus'], function (Item, _, parseTextDoc, getNewGuid, transaction, cursorPosition, itemOfFocus) {

  Item.prototype.insertTextAtCursor = function(insertingText) {
    if (!itemOfFocus.is(this)) return;
    var selection = _.pick(document.getSelection(),
        'anchorOffset',
        // 'baseOffset',
        'extentOffset',
        'focusOffset'
        // 'rangeCount'
        );

    var text = this.text;
    var $input;
    if (this.mode === 'command') {
      $input = this.$('#input' + this.id);
      text = $input.text();
    }
    var extentOffset = _.isNumber(selection.extentOffset) ? selection.extentOffset : selection.focusOffset;
    var start = Math.min(selection.anchorOffset, extentOffset);
    var count = Math.max(selection.anchorOffset, extentOffset) - start;
    var textArray = _.toArray(text);

    textArray.splice(start, count, insertingText);

    transaction(function () {
      if (this.mode === 'command') {
        $input.text(textArray.join(''));
        var range = document.createRange();
        var sel = window.getSelection();
        range.collapse(true);
        range.setStart($input[0].childNodes[0], start + insertingText.length);
        range.setEnd($input[0].childNodes[0], start + insertingText.length);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        this.text = textArray.join('');
        cursorPosition.set(this.text, this.depth, start + insertingText.length);
        this.render();
        this.focus();
      }
    }, this);
  };

});
