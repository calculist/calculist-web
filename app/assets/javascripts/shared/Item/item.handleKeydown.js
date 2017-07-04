calculist.register('item.handleKeydown', ['_','$','customKeyboardShortcuts','cursorPosition','transaction','commandTypeahead','zoomPage','executeCommand','eventHub'],function (_, $, customKeyboardShortcuts, cursorPosition, transaction, commandTypeahead, zoomPage, executeCommand, eventHub) {

  return function(e) {
    eventHub.trigger('item.handleKeydown:before', this, arguments)
    var anchorOffset, baseOffset, expandOrCollapse, extentOffset, focusOffset, rangeCount, _ref, _ref1;
    this.keydownData || (this.keydownData = {});
    if (customKeyboardShortcuts(this, e)) {
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
    } else if (e.which === 38) { // 38 = up
      if (e.metaKey) {
        e.preventDefault();
        zoomPage.getTopItem().focus();
      } else if (e.altKey) {
        e.preventDefault();
        this.up(true, true);
      } else {
        (function () {
          var lines = this.getInputLines(),
              lineCount = lines.length,
              currentCursorPosition = cursorPosition.getWithCurrentOffset(this.text, this.depth),
              currentLine = lines.reduce(function (cl, line, i) {
                cl.charCount += line.length;
                if (cl.index == null && currentCursorPosition < cl.charCount) cl.index = i;
                return cl;
              }, {charCount: 0, index: null}).index;
          if (currentLine == null) currentLine = lineCount - 1;
          if (currentLine === 0 || lineCount <= 1) {
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
          var lines = this.getInputLines(),
              lineCount = lines.length,
              currentCursorPosition = cursorPosition.getWithCurrentOffset(this.text, this.depth),
              currentLine = lines.reduce(function (cl, line, i) {
                cl.charCount += line.length;
                if (cl.index == null && currentCursorPosition < cl.charCount) cl.index = i;
                return cl;
              }, {charCount: 0, index: null}).index;
          if (currentLine == null) currentLine = lineCount - 1;
          if (currentLine >= (lineCount - 1) || lineCount <= 1 || currentCursorPosition >= this.text.length) {
            if (lineCount > 1) {
              var adjustedCursorPosition = currentCursorPosition - (this.text.length - lines[lineCount - 1].length);
              cursorPosition.set(lines[lineCount - 1], this.depth, adjustedCursorPosition);
            }
            e.preventDefault();
            this.down();
          }
        }).call(this);
      }
    } else if (e.which === 8) { // 8 = delete
      if (!this.text) {
        e.preventDefault();
        cursorPosition.set('', 1, Infinity);
        transaction(this.deleteItem, this);
      } else if (e.altKey && anchorOffset === 0) {
        e.preventDefault();
        transaction(function () {
          if (!this.parent) return;
          var i = _.indexOf(this.parent.items, this);
          var itemAbove = this.parent.items[i - 1] || this.parent;
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
      }
    } else if (e.which === 68 && e.ctrlKey && e.shiftKey) { // 68 = d
      transaction(executeCommand, null, this, 'duplicate');
    } else if ((e.which === 51 || e.which === 190) && e.shiftKey && !e.ctrlKey && !e.altKey) { // 51 = # and 190 = >
      if (this.text.substring(anchorOffset - 3, anchorOffset) === '[=]') {
        e.preventDefault();
        (function () {
          var $input = this.$('#input' + this.id);
          var textArray = _.toArray($input.text());
          var char = e.which === 51 ? '#' : '>';
          textArray.splice(anchorOffset - 3, 3, '[=' + char + ']');
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
    eventHub.trigger('item.handleKeydown', this, arguments)
  };

});
