lm.register('parseTextDoc', ['_'], function (_) {

  return function (textDoc) {
    var flatDoc, flatDocById, flatListsByDepth, justData, lines;
    lines = _.compact(textDoc.split('\n'));
    flatDoc = [];
    flatDocById = {};
    flatListsByDepth = {};
    _.each(lines, function(line) {
      var chars, index, item, previousItem, previousItemAtThisDepth, _name;
      item = {};
      flatDoc.push(item);
      index = flatDoc.length - 1;
      previousItem = flatDoc[index - 1];
      chars = _.toArray(line);
      item.depth = _.takeWhile(chars, function(char) {
        return char === ' ';
      }).length;
      (flatListsByDepth[_name = item.depth] || (flatListsByDepth[_name] = [])).push(item);
      item.listIndex = flatListsByDepth[item.depth].length - 1;
      previousItemAtThisDepth = flatListsByDepth[item.depth][item.listIndex - 1];
      if (previousItem && item.depth > previousItem.depth) {
        item.parent = previousItem;
      } else if (previousItem && item.depth === previousItem.depth) {
        item.parent = previousItem.parent;
      } else if (previousItem && item.depth < previousItem.depth) {
        item.parent = previousItemAtThisDepth != null ? previousItemAtThisDepth.parent : void 0;
      }
      if (item.parent) {
        item.parent.children.push(item);
      }
      item.items = item.children = [];
      item.text = chars.slice(item.depth).join('');
    });
    return (justData = function(items) {
      return _.map(items, function(item) {
        return {
          text: item.text,
          $items: item.items.length ? justData(item.items) : []
        };
      });
    })(flatListsByDepth[0]);
  };

});
