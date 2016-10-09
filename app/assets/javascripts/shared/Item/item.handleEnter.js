calculist.register('item.handleEnter',['_','$','cursorPosition'],function (_, $, cursorPosition) {

  return function (e, anchorOffset) {
    e.preventDefault();
    if (this.mode === 'command') {
      this.executeCommand(e.target.textContent);
      this.exitCommandMode();
      this.shouldSoftRender = true;
    } else if (e.ctrlKey && !e.shiftKey) {
      this.enterCommandMode();
    } else if (e.shiftKey) {
      this.$('.input:first').text(this.text + '\n');
    } else if (this.text && anchorOffset === 0) {
      if (sessionStorage.zoomGuid === this.guid) {
        return;
      }
      (this.$parent || this).addNewChildBefore(this);
      this.hasFocus = false;
    } else if (this.text) {
      var newItemText = '';
      if (this.text.length > anchorOffset) {
        newItemText = this.text.substring(anchorOffset);
        this.changeText(this.text.substring(0, anchorOffset));
        cursorPosition.set(newItemText, this.depth, 0);
      }
      if (sessionStorage.zoomGuid === this.guid || !this.$parent) {
        this.addNewChildBefore(this.$items[0] || this, newItemText);
      } else {
        this.$parent.addNewChildAfter(this, newItemText);
      }
      this.hasFocus = false;
    } else {
      this.outdent();
    }
  };

});
