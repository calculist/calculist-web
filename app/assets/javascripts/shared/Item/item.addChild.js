calculist.register('item.addChild',['_','getNewGuid'], function (_, getNewGuid) {

  return function(text) {
    var child;
    child = new this.constructor({
      text: text,
      $parent: this,
      guid: getNewGuid()
    });
    this.$items.push(child);
    this.renderChildren();
    child.focus();
  };

});

calculist.register('item.addNewChildBefore',['_','getNewGuid'], function (_, getNewGuid) {

  return function(beforeChild, text) {
    var newChild;
    if (beforeChild === this) {
      return this.addChild(text);
    }
    newChild = new this.constructor({
      text: text,
      $parent: this,
      guid: getNewGuid()
    });
    this.insertBefore(newChild, beforeChild);
    this.renderChildren();
    newChild.focus();
  };

});

calculist.register('item.addNewChildAfter',['_','getNewGuid'], function (_, getNewGuid) {

  return function(afterChild, text) {
    var newChild;
    if (afterChild === this) {
      return this.addChild(text);
    }
    newChild = new this.constructor({
      text: text,
      $parent: this,
      guid: getNewGuid()
    });
    this.insertAfter(newChild, afterChild);
    this.renderChildren();
    newChild.focus();
  };

});
