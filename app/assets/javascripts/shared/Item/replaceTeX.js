lm.register('replaceTeX', ['katex'], function (katex) {

  return function(string) {
    return string.replace(/\$\$(.*?)\$\$/g, function(s, tex) {
      try {
        return katex.renderToString(_.unescape(tex));
      } catch (e) {
        return "" + e;
      }
    });
  };

});
