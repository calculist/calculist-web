calculist.require(['Item','_','getNewGuid','itemsByGuid'], function (Item, _, getNewGuid, itemsByGuid) {

  var prepareItems = function (items, _this) {
    return _.map(_.compact(items), function(item) {
      var newItemOptions = _.isPlainObject(item) ? _.clone(item) : item.toJSON();
      newItemOptions.parent = _this;
      newItemOptions.guid || (newItemOptions.guid = getNewGuid());
      newItemOptions.invisible = _this.invisible;
      return new Item(newItemOptions);
    });
  };

  var callDepth = 0;
  var callValueOf = function (item) {
    item.valueOf();
    _.each(item.items, callValueOf);
  };

  Item.prototype.initialize = function(options) {
    this.guid = options.guid;
    if (!this.guid) throw new Error('guid required');
    if (itemsByGuid[this.guid] && itemsByGuid[this.guid] != this) {
      throw new Error('guids must be unique');
    }
    if (options.invisible) {
      // NOTE Invisible items are items that are not
      // descendents of window.topItem. userPreferences
      // are one example.
      this.invisible = true;
    } else {
      itemsByGuid[this.guid] = this;
    }
    this.id || (this.id = _.uniqueId());
    this.text || (this.text = options.text || '');
    this.parent = options.parent;
    this.depth = this.parent ? this.parent.depth + 1 : 0;
    this.collapsed = options.collapsed && !!this.parent;
    this.sort_order = options.sort_order;
    ++callDepth;
    this.items = prepareItems(options.items, this);
    --callDepth;
    if (callDepth === 0) callValueOf(this);
  };

});
