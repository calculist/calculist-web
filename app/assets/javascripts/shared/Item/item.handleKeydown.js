calculist.register('item.handleKeydown', ['_','$','cursorPosition','transaction','commandTypeahead','zoomPage'],function (_, $, cursorPosition, transaction, commandTypeahead, zoomPage) {

  return function(e) {
    var anchorOffset, baseOffset, expandOrCollapse, extentOffset, focusOffset, rangeCount, _ref, _ref1;
    this.keydownData || (this.keydownData = {});
    if (this.customKeyboardShortcuts(e)) {
      e.preventDefault();
      return;
    }
    _ref = document.getSelection(), anchorOffset = _ref.anchorOffset, baseOffset = _ref.baseOffset, extentOffset = _ref.extentOffset, focusOffset = _ref.focusOffset, rangeCount = _ref.rangeCount;
    if (this.mode === 'command') {
      if (!_.includes([13, 27, 192], e.which)) {
        commandTypeahead.update(e);
        return;
      }
    }
    if (e.which === 13) {
      transaction(this.handleEnter, this, e, anchorOffset);
    } else if (e.which === 9) { // tab
      e.preventDefault();
      if (e.shiftKey) {
        transaction(this.outdent, this);
      } else {
        transaction(this.indent, this);
      }
      this.shouldSoftRender = true;
    } else if (e.which === 38) { // 38 = up
      if (e.metaKey) {
        e.preventDefault();
        zoomPage.getTopItem().focus();
      } else if (e.altKey) {
        e.preventDefault();
        this.up(true, true);
      } else {
        (function () {
          var lineWidth = Math.max(this.getLineWidthInCharacters(), 1),
              lineCount = Math.ceil(this.text.length / lineWidth),
              currentCursorPosition = cursorPosition.getWithCurrentOffset(this.text, this.depth),
              currentLine = Math.floor(currentCursorPosition / (lineWidth || Infinity));
          // console.log('up', lineWidth, lineCount, currentCursorPosition, currentLine);
          if (true || currentLine === 0 || lineCount <= 1) {
            e.preventDefault();
            this.up();
          }
        }).call(this);
      }
    } else if (e.which === 40) { // 40 = down
      if (e.metaKey) {
        e.preventDefault();
        zoomPage.getLastVisibleItem().focus();
      } else if (e.altKey) {
        e.preventDefault();
        this.down(true, true);
      } else {
        (function () {
          var lineWidth = this.getLineWidthInCharacters(),
              lineCount = Math.ceil(this.text.length / lineWidth),
              currentCursorPosition = cursorPosition.getWithCurrentOffset(this.text, this.depth),
              currentLine = Math.floor(currentCursorPosition / (lineWidth || Infinity));
          // console.log('down', lineWidth, lineCount, currentCursorPosition, currentLine);
          if (true || currentLine >= (lineCount - 1) || lineCount <= 1 || currentCursorPosition >= this.text.length) {
            e.preventDefault();
            this.down();
          }
        }).call(this);
      }
    } else if (e.which === 8) { // 8 = delete
      if (!this.text) {
        e.preventDefault();
        transaction(this.deleteItem, this);
      } else if (e.altKey && anchorOffset === 0) {
        e.preventDefault();
        transaction(function () {
          if (!this.$parent) return;
          var i = _.indexOf(this.$parent.$items, this);
          var itemAbove = this.$parent.$items[i - 1] || this.$parent;
          var newText = itemAbove.text + this.text;
          var newCursorOffset = itemAbove.text.length;
          itemAbove.changeText(newText);
          cursorPosition.set(newText, itemAbove.depth, newCursorOffset);
          this.deleteItem();
        }, this);
      }
    } else if (e.which === 27) { // 27 = esc
      if (this.mode === 'command') {
        this.exitCommandMode();
      } else {
        this.$("#input" + this.id).blur();
        this.hasFocus = false;
      }
    } else if (e.which === 68 && e.ctrlKey && e.shiftKey) { // 68 = d
      transaction(this.executeCommand, this, 'duplicate');
    } else if (e.which === 190 && e.shiftKey && !e.ctrlKey && !e.altKey) { // 190 = >
      if (this.text.substring(anchorOffset - 3, anchorOffset) === '[=]') {
        e.preventDefault();
        (function () {
          var $input = this.$('#input' + this.id);
          var textArray = _.toArray($input.text());
          textArray.splice(anchorOffset - 3, anchorOffset, '[=>]');
          $input.text(textArray.join(''));
          var range = document.createRange();
          var sel = window.getSelection();
          range.collapse(true);
          range.setStart($input[0].childNodes[0], anchorOffset + 1);
          range.setEnd($input[0].childNodes[0], anchorOffset + 1);
          sel.removeAllRanges();
          sel.addRange(range);
        }).call(this);
      }
    }
    this.keydownData.previousKey = e.which;
    this.keydownData.previousIndex = anchorOffset;
  };

});
