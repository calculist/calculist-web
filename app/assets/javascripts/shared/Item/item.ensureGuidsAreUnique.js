calculist.require(['Item','getNewGuid', '_'], function (Item, getNewGuid, _) {

  Item.prototype.ensureGuidsAreUnique = function (itemsByGuid) {
    var isTreeTop = !itemsByGuid;
    if (isTreeTop) {
      itemsByGuid = { count: 0, duplicates: 0 };
    }
    ++itemsByGuid.count;
    if (itemsByGuid[this.guid]) {
      ++itemsByGuid.duplicates;
      this.guid = getNewGuid();
    }
    itemsByGuid[this.guid] = this;
    _.each(this.items, _.method('ensureGuidsAreUnique', itemsByGuid));
    if (isTreeTop && itemsByGuid.duplicates) {
      // console.log(itemsByGuid.duplicates + ' of ' + itemsByGuid.count);
      // postAnalyticsToServer(...);
    }
    return itemsByGuid.duplicates;
  };

});
