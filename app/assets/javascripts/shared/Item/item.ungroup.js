calculist.require(['Item','_','getNewGuid','itemOfFocus'], function (Item, _, getNewGuid, itemOfFocus) {

  Item.prototype.ungroup = function(groupAttribute) {
    var items = _.clone(this.items);
    if (groupAttribute) {
      var groupingItem = this;
      _.each(items, function(groupedItem) {
        var existingAttributeItem = _.find(groupedItem.items, { key: groupAttribute });
        if (existingAttributeItem) {
          existingAttributeItem.text = existingAttributeItem.key + ' [:] ' + groupingItem.valueOf();
        } else {
          var newItem = new Item({
            parent: groupedItem,
            guid: getNewGuid(),
            text: "" + groupAttribute + " [:] " + groupingItem.valueOf()
          });
          groupedItem.items.push(newItem);
          newItem.refreshSortOrder();
        }
      });
    }
    _.eachRight(items, _.method('outdent'));
    this.items = items; // Needed for undo to work
    _.pull(this.parent.items, this);
    itemOfFocus.change(items[0]);
    items[0].parent.refreshDepth();
    items[0].parent.renderChildren();
    _.defer(function () { items[0].focus(); });
    return this.items;
  };

});
