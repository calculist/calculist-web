lm.require(['Item','_','getNewGuid'], function (Item, _, getNewGuid) {

  Item.prototype.ungroupItems = function(groupAttribute) {
    var _this = this;
    _this.$items = _.flatten(_.map(_this.$items, function(groupingItem) {
      return _.each(groupingItem.$items, function(groupedItem) {
        groupedItem.$parent = _this;
        if (groupAttribute) {
          var existingAttributeItem = _.find(groupedItem.$items, { key: groupAttribute });
          if (existingAttributeItem) {
            existingAttributeItem.text = existingAttributeItem.key + ' [:] ' + groupingItem.valueOf();
          } else {
            var newItem = new Item({
              $parent: groupedItem,
              guid: getNewGuid(),
              text: "" + groupAttribute + " [:] " + groupingItem.valueOf()
            });
            groupedItem.$items.push(newItem);
            newItem.refreshSortOrder();
          }
        }
      });
    }));
    _this.refreshDepth();
    _this.renderChildren();
    _this.save();
    return this.$items;
  };

});
