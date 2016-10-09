calculist.require(['Item','_'], function (Item, _) {

  Item.prototype.ungroup = function() {
    var $items = _.clone(this.$items);
    _.eachRight(this.$items, _.method('outdent'));
    this.$items = $items; // Needed for undo to work
    this.deleteItem(true);
    _.defer(_.bind($items[0].focus, $items[0]));
    return this.$items;
  };

});
