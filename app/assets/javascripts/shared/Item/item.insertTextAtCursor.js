lm.require(['Item','_','parseTextDoc','getNewGuid','transaction','cursorPosition'], function (Item, _, parseTextDoc, getNewGuid, transaction, cursorPosition) {

  Item.prototype.insertTextAtCursor = function(insertingText, skipRender) {
    if (!this.hasFocus) return;
    var selection = _.pick(document.getSelection(),
        'anchorOffset',
        // 'baseOffset',
        'extentOffset'
        // 'focusOffset',
        // 'rangeCount'
        );

    var start = Math.min(selection.anchorOffset, selection.extentOffset),
        end = Math.max(selection.anchorOffset, selection.extentOffset),
        range = _.range(start, end),
        textArray = _.toArray(this.text);

    _.pullAt(textArray, range);

    textArray.splice(start, 0, insertingText);

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
