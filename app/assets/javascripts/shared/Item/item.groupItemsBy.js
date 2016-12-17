calculist.require(['Item','_','getNewGuid'], function (Item, _, getNewGuid) {

  Item.prototype.groupItemsBy = function(grouper, options) {
    var groupedItems, key;
    if (options == null) {
      options = {};
    }
    if (_.isString(grouper)) {
      key = grouper;
      grouper = function(item) {
        return "" + item.$item(key);
      };
    }
    groupedItems = _.groupBy(this.items, grouper);
    if (options.destructive) {
      _.each(this.items, function(item) {
        var it = item.$item(key);
        if (it) {
          _.pull(it.$parent.items, it);
        }
      });
    }
    this.items = _.map(groupedItems, (function(_this) {
      return function(items, text) {
        var item = new Item({
          guid: getNewGuid(),
          $parent: _this,
          items: [],
          text: text
        });
        item.items = items;
        _.each(item.items, function (child) {
          child.$parent = item;
        });
        return item;
      };
    })(this));
    (this.$parent || this).refreshDepth();
    return this.items;
  };

});
