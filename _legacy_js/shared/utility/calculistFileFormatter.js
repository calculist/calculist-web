calculist.register('calculistFileFormatter', ['_', 'parseTextDoc'], function (_, parseTextDoc) {

  return {
    toCalculistFile: function (topItem) {
      return JSON.stringify(topItem, null, ' ');
    },
    parseFile: function (fileString) {
      return parseTextDoc(fileString, {withGuids: true});
    }
  }
});
