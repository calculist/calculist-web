calculist.require(['Item','_','parseTextDoc','getNewGuid','transaction','cursorPosition','itemOfFocus'], function (Item, _, parseTextDoc, getNewGuid, transaction, cursorPosition, itemOfFocus) {

  Item.prototype.insertTextAtCursor = function(insertingText, skipRender) {
    if (!itemOfFocus.is(this)) return;
    var selection = _.pick(document.getSelection(),
        'anchorOffset',
        // 'baseOffset',
        'extentOffset'
        // 'focusOffset',
        // 'rangeCount'
        );

    var start = Math.min(selection.anchorOffset, selection.extentOffset),
        count = Math.max(selection.anchorOffset, selection.extentOffset) - start,
        textArray = _.toArray(this.text);

    textArray.splice(start, count, insertingText);

    transaction(function () {
      this.text = textArray.join('');
      if (!skipRender) {
        cursorPosition.set(this.text, this.depth, start + insertingText.length);
        this.render();
        this.focus();
      }
    }, this);

    // console.log(selection, text);
  };

});
