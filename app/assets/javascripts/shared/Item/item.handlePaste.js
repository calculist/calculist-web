calculist.require(['Item','_','parseTextDoc','getNewGuid','transaction','itemOfFocus','itemsByGuid','calculistFileFormatter'], function (Item, _, parseTextDoc, getNewGuid, transaction, itemOfFocus, itemsByGuid, calculistFileFormatter) {

  Item.prototype.handlePaste = function(e, options) {
    if (this.mode === 'command') return;
    var content, selectionEnd, selectionStart, _ref, _ref1;
    // content =  ? e : e.originalEvent.clipboardData.getData('text/plain');
    // _ref = e.target, selectionStart = _ref.selectionStart, selectionEnd = _ref.selectionEnd;
    if (_.isString(e)) {
      content = e;
    } else {
      content = e.originalEvent.clipboardData.getData('text/plain');
      e.preventDefault();
    }
    if (content.split('\n').length > 1) {
      transaction(function () {
        var isCalculistFile = options && options.isCalculistFile;
        var items = isCalculistFile ? calculistFileFormatter.parseFile(content) : parseTextDoc(content);
        var firstItem = items.shift();
        if (itemOfFocus.is(this)) {
          this.insertTextAtCursor(firstItem.text);
        } else {
          this.changeText(firstItem.text);
        }
        if (isCalculistFile) {
          this.guid = firstItem.guid;
          itemsByGuid[this.guid] = this;
        }
        newChildren = firstItem.items.map((function(_this) {
          return function(item) {
            item.parent = _this;
            item.guid || (item.guid = getNewGuid());
            return new Item(item);
          };
        })(this));
        this.items.unshift.apply(this.items, newChildren);
        this.refreshDepth();
        if (items.length) {
          var parent = this.parent || this;
          _.reduce(items, function (previousSibling, item) {
            item.parent = parent;
            item.guid = getNewGuid();
            item = new Item(item);
            parent.insertAfter(item, previousSibling);
            return item;
          }, this);
          parent.refreshDepth();
          parent.renderChildren();
        } else {
          this.renderChildren();
        }
        this.focus();
      }, this);
    } else {
      this.insertTextAtCursor(content);
    }
  };

});
