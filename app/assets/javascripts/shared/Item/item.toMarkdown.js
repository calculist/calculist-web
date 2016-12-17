calculist.register('item.toMarkdown', ['_'], function (_) {

    return function(depth, computed, hideCollapsed) {
      var nestedText, text;
      if (!depth) depth = 0;
      if (computed !== false) computed = true;
      text = computed ? this.getComputedText() : this.text;
      if ((hideCollapsed && this.collapsed) || this.items.length === 0) {
        nestedText = '';
      } else {
        nestedText = _.map(this.items, _.method('toMarkdown', depth + 4, computed, hideCollapsed)).join('');
      }
      var trimmedText = _.trim(text);
      if (depth === 0) {
        return trimmedText + '\n' + _.repeat('=', trimmedText.length) + '\n\n' + nestedText;
      } else {
        return _.repeat(' ', depth - 4) + '* ' + trimmedText + '\n' + nestedText;
      }
    };

});
