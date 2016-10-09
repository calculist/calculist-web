calculist.register('item.pivotItems',['_','getNewGuid'], function (_, getNewGuid) {

  return function () {

    var newChildrenByKey = {};
    var Item = this.constructor;
    var parent = this;
    var getNewText = function (a, b) {
      if (b.hasVal) {
        return a.key + ' ' + b.parsedText.separator + ' ' + b.parsedText.val;
      }
      return a.key;
    };

    _.each(this.$items, function (child) {
      child.valueOf();
      _.each(child.$items, function (grandchild) {
        grandchild.valueOf();
        if (!newChildrenByKey[grandchild.key]) {
          newChildrenByKey[grandchild.key] = new Item({
            guid: getNewGuid(),
            text: getNewText(grandchild, child),
            $parent: parent,
            $items: []
          });
        }
        var newGrandchild = new Item({
          guid: getNewGuid(),
          text: getNewText(child, grandchild),
          $parent: newChildrenByKey[grandchild.key],
          $items: []
        });

        newGrandchild.$items = grandchild.$items;

        newChildrenByKey[grandchild.key].$items.push(newGrandchild);
      });
    });

    this.$items = _.values(newChildrenByKey);
    this.refreshDepth();
    this.renderChildren();

  };

});
