calculist.register('item.handleEnter',['_','$','cursorPosition','executeCommand','itemOfFocus'],function (_, $, cursorPosition, executeCommand, itemOfFocus) {

  var addNewItem = function (_this, newItemText) {
    if (sessionStorage.zoomGuid === _this.guid || !_this.parent) {
      _this.addNewChildBefore(_this.items[0] || _this, newItemText);
    } else {
      _this.parent.addNewChildAfter(_this, newItemText);
    }
  };

  return function (e, anchorOffset) {
    e.preventDefault();
    if (this.mode === 'command' || this.mode === 'search:command') {
      executeCommand(this, e.target.textContent);
      this.exitCommandMode();
    } else if (this.mode === 'search') {
      var selectedItem = this.searchResults && this.searchResults.items[this.searchResults.selectionIndex];
      if (selectedItem) {
        var nextParent = selectedItem.parent;
        var guard = 0;
        while (nextParent && ++guard < 100) {
          nextParent.wasCollapsed = false;
          nextParent.collapsed = false;
          nextParent = nextParent.parent;
        }
        executeCommand(this, 'exit search mode');
        itemOfFocus.change(selectedItem);
      } else {
        executeCommand(this, 'exit search mode');
        this.focus();
      }
    } else if (e.ctrlKey && !e.shiftKey) {
      this.enterCommandMode();
    } else if (e.shiftKey) {
      this.$('.input:first').text(this.text + '\n');
    } else if (this.text && anchorOffset === 0) {
      if (sessionStorage.zoomGuid === this.guid) {
        return;
      }
      (this.parent || this).addNewChildBefore(this);
    } else if (this.text) {
      var newItemText = '';
      if (this.text.length > anchorOffset) {
        newItemText = this.text.substring(anchorOffset);
        this.changeText(this.text.substring(0, anchorOffset));
        cursorPosition.set(newItemText, this.depth, 0);
      }
      addNewItem(this, newItemText);
    } else {
      var previousDepth = this.depth;
      this.outdent();
      if (this.depth === previousDepth) addNewItem(this, '');
    }
  };

});
