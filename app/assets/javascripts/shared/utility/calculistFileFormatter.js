calculist.register('calculistFileFormatter', ['_', 'parseTextDoc'], function (_, parseTextDoc) {

  return {
    toCalculistFile: function (topItem) {
      return topItem.toText(0, {computed: false, prependGuid: true});
    },
    parseFile: function (fileString) {
      return parseTextDoc(fileString, {withGuids: true});
    }
  }
});
