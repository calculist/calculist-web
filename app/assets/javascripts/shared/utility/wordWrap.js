calculist.register('wordWrap', [], function () {
  // Adapted from https://github.com/jonschlinkert/word-wrap
  return {
    getLines: function(string, width) {
      string || (string = '');
      var reg = new RegExp('.{1,' + Math.floor(width) + '}([\\s\u200B]+|$)|[^\\s\u200B]+?([\\s\u200B]+|$)', 'g');
      return string.match(reg) || [];
    }
  };
});
