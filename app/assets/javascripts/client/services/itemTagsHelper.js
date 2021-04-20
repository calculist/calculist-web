calculist.register('itemTagsHelper', ['syncAnimationFrame'], function (syncAnimationFrame) {
  var getReferencesForTag = function (tag, contextItem) {
    // TODO make this more efficient
    return (contextItem.text.includes(tag) ? [contextItem] : []).concat(
      contextItem.items.reduce(function (its, it) {
        return its.concat(getReferencesForTag(tag, it));
      }, [])
    );
  };
  var getLabelIndexAndCount = function (label, contextItem, currentIndex) {

  };
  var currentAF, itemsByTagId = {};
  return {
    getItemByIdTag: function (idTag) {
      // TODO make this more efficient
      // TODO don't refer to window
      if (currentAF !== syncAnimationFrame()) {
        currentAF = syncAnimationFrame();
        itemsByTagId = {};
      }
      if (itemsByTagId.hasOwnProperty(idTag)) return itemsByTagId[idTag];
      itemsByTagId[idTag] = window.topItem.$item(function (it) {
        return it.key.includes('\\id[' + idTag + ']')
      });
      return itemsByTagId[idTag];
    },
    getReferencesForIdTag: function (idTag, contextItem) {
      // TODO don't refer to window
      return getReferencesForTag('\\ref[' + idTag + ']', contextItem || window.topItem);
    },
    getLabelIndexAndCount: function (label, contextItem) {
      var refs = getReferencesForTag('\\label[' + label + ']', window.topItem);
      var index = refs.indexOf(contextItem);
      return [index, refs.length];
    }
  }
});
