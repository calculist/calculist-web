calculist.register('item.addChild',['_','getNewGuid','itemOfFocus'], function (_, getNewGuid, itemOfFocus) {

  return function(text) {
    var child;
    child = new this.constructor({
      text: text,
      parent: this,
      guid: getNewGuid()
    });
    this.items.push(child);
    itemOfFocus.change(child);
    this.renderChildren();
    child.focus();
  };

});

calculist.register('item.addNewChildBefore',['_','getNewGuid','itemOfFocus'], function (_, getNewGuid, itemOfFocus) {

  return function(beforeChild, text) {
    var newChild;
    if (beforeChild === this) {
      return this.addChild(text);
    }
    newChild = new this.constructor({
      text: text,
      parent: this,
      guid: getNewGuid()
    });
    this.insertBefore(newChild, beforeChild);
    itemOfFocus.change(newChild);
    this.renderChildren();
    newChild.focus();
  };

});

calculist.register('item.addNewChildAfter',['_','getNewGuid','itemOfFocus'], function (_, getNewGuid, itemOfFocus) {

  return function(afterChild, text) {
    var newChild;
    if (afterChild === this) {
      return this.addChild(text);
    }
    newChild = new this.constructor({
      text: text,
      parent: this,
      guid: getNewGuid()
    });
    this.insertAfter(newChild, afterChild);
    itemOfFocus.change(newChild);
    this.renderChildren();
    newChild.focus();
  };

});
