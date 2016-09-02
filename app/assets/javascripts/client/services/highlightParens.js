lm.register('highlightParens', ['_','$'], function (_, $) {
  return function (el, anchorOffset) {
    var $el = $(el),
        text = $el.text(),
        textArray = _.toArray(text),
        openParenIndices = [],
        closeParenIndices = [];

    _.each(textArray, function (char, i) {
      if (char === '(') openParenIndices.push(i);
      if (char === ')') closeParenIndices.push(i);
    });

    // TODO
  };
});
