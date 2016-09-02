lm.register('replaceTeX', ['katex'], function (katex) {

  return function(string) {
    return string.replace(/(?:&#96;)TeX(.*?)(?:&#96;)/g, function(s, tex) {
      try {
        return katex.renderToString(_.unescape(tex));
      } catch (e) {
        return "" + e;
      }
    });
  };

});
