import katex from 'katex';

const replaceTeX = (function (katex) {

  return function(string) {
    return string.replace(/\$\$(.*?)\$\$/g, function(s, tex) {
      try {
        return katex.renderToString(_.unescape(tex));
      } catch (e) {
        return "" + e;
      }
    });
  };

})(katex);

export default replaceTeX;
