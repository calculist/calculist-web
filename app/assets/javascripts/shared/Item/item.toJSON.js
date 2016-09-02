lm.require(['Item','_','getNewGuid'], function (Item, _, getNewGuid) {

  var toJSON = function(mapper) {
    return {
      text: this.text,
      $items: _.map(this.$items, mapper),
      collapsed: !!this.collapsed,
      sort_order: this.sort_order,
      guid: this.guid
    };
  };

  Item.prototype.toJSON = _.partial(toJSON, _.method('toJSON'));
  Item.prototype.toClonedJSON = function () {
    return {
      text: this.text,
      $items: _.map(this.$items, _.method('toClonedJSON')),
      collapsed: !!this.collapsed,
      sort_order: this.sort_order,
      guid: getNewGuid()
    };
  };
  Item.prototype.toFlatJSON = function() {
    return {
      text: this.text,
      $items: _.map(this.$items, 'guid').toString(),
      collapsed: !!this.collapsed,
      sort_order: this.sort_order,
      guid: this.guid
    };
  };

  Item.prototype.toFlatJSON_v2 = function() {
    // NOTE THIS FUNCTION IS EXTREMELY IMPORTANT.
    // MESSING UP THIS FUNCTION COULD RESULT IN
    // BAD DATA.
    // TODO Write tests for this.
    return {
      text: this.text,
      parent_guid: (this === window.topItem ? null : this.$parent.guid),
      is_collapsed: !!this.collapsed,
      sort_order: this.sort_order,
      guid: this.guid
    };
  };
});
