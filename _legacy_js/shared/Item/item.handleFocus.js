calculist.require(['Item', 'cursorPosition','isReadOnly','itemOfFocus','itemOfDrag', 'editMode'], function (Item, cursorPosition, isReadOnly, itemOfFocus, itemOfDrag, editMode) {
  // TODO move this
  Item.prototype.focusContainingList = function () {
    if (this.parent) {
      this.parent.$('ul:first').addClass('focus');
      // this.parent.focusContainingList();
    }
  };
  Item.prototype.blurContainingList = function () {
    if (this.parent) {
      this.parent.$('ul:first').removeClass('focus');
      this.parent.blurContainingList();
    }
  };

  var setCursorPosition = function (node, charIndex) {
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(node, charIndex);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  var setCursorPositionFromClickEvent = function (_this, e) {
    var lines = _this.getInputLines();
    var rect = e.currentTarget.getBoundingClientRect();
    var lineHeight = rect.height / lines.length;
    var charWidth = 8; // FIXME
    var lineIndex = Math.floor(e.offsetY / lineHeight);
    var lineCharIndex = Math.floor(e.offsetX / charWidth);
    var charIndex = lines.slice(0, lineIndex).reduce(function (s, line) {
      return s + line.length;
    }, 0) + lineCharIndex;
    cursorPosition.set(_this.text, _this.depth, charIndex);
    setCursorPosition(e.currentTarget.childNodes[0], Math.min(charIndex, _this.text.length));
  };

  Item.prototype.handleNonEditFocus = function(e) {
    if (editMode.isEditing()) return;
    if (itemOfFocus.is(this)) {
      editMode.set(true);
      setCursorPositionFromClickEvent(this, e);
      var $input = this.$("#input" + this.id);
      $input.focus();
    } else {
      this.handleFocus(e);
    }
  };

  Item.prototype.handleFocus = function(e) {
    if (this.mode === 'search' || this.mode === 'command') return;
    var nextParent = this.parent;
    var guard = 0;
    while (nextParent && ++guard < 100) {
      nextParent.wasCollapsed = false;
      nextParent.collapsed = false;
      nextParent = nextParent.parent;
    }
    var dragItem = itemOfDrag.get();
    if (dragItem && itemOfDrag !== this) return e.preventDefault();
    itemOfFocus.change(this);
    sessionStorage.focusGuid = this.guid;
    var $input = this.$("#input" + this.id);
    var previousHeight = $input.height();
    this.showTrueValue();
    this.showComputedValue();
    this.showLinkButtons();
    this.focusContainingList();
    $input.addClass('focus');
    $input.removeClass('callout');
    $input.css({minHeight:previousHeight});
    setCursorPosition($input[0].childNodes[0], Math.min(cursorPosition.get(this.depth), this.text.length));
    this.justFocused = true;
    if ($input[0].scrollIntoViewIfNeeded) $input[0].scrollIntoViewIfNeeded();
    editMode.cancelExit();
  };

});
