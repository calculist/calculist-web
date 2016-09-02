lm.require(['Item'], function (Item) {

  Item.prototype.getTopItem = function() {
    var item;
    item = this;
    while (item.$parent) {
      item = item.$parent;
    }
    return item;
  };

});
