calculist.register('parseTextDoc', ['_'], function (_) {

  var GUID_SEPARATOR = '|';

  return function (textDoc, options) {
    var withGuids = options ? options.withGuids : null;
    var lines = _.compact(textDoc.split('\n'));
    var flatDoc = [];
    var flatDocById = {};
    var flatListsByDepth = {};
    _.each(lines, function(line) {
      var chars, index, item, previousItem, previousItemAtThisDepth, _name;
      item = {};
      flatDoc.push(item);
      index = flatDoc.length - 1;
      previousItem = flatDoc[index - 1];
      var guid;
      if (withGuids) {
        line = line.split(GUID_SEPARATOR);
        guid = line.shift();
        line = line.join(GUID_SEPARATOR);
      }
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
      item.guid = guid;
    });
    var justData = function(items) {
      return _.map(items, function(item) {
        return {
          text: item.text,
          items: item.items.length ? justData(item.items) : [],
          guid: item.guid,
        };
      });
    };
    return justData(flatListsByDepth[0]);
  };

});
