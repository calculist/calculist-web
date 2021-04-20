calculist.register('parseUntilBalanced', [], function () {
  // "ab (c [d {e}]) f (g)" returns "(c [d {e}])"
  return function (text) {
    var opens = function (char) {
      return char === '"' || char === "'" ||
        char === '(' || char === '[' || char === '{';
    };
    var closes = function (openingChar, char) {
      switch (openingChar) {
        case '"':
          return char === '"';
        case "'":
          return char === "'";
        case '(':
          return char === ')';
        case '[':
          return char === ']';
        case '{':
          return char === '}';
        default:
          return false
      }
    };
    var i = 0;
    var stack = [];
    var escaping = false;
    var balancedText = '';
    while (i < text.length) {
      var char = text[i];
      i += 1;
      var openingChar = stack[stack.length - 1];
      var inString = openingChar === '"' || openingChar === "'";
      if (openingChar && escaping) {
        balancedText += char;
        escaping = false;
      } else if (!openingChar && escaping) {
        escaping = false;
      } else if (char === '\\') {
        if (openingChar) balancedText += char;
        escaping = true;
      } else if (closes(openingChar, char)) {
        stack.pop();
        balancedText += char;
      } else if (inString) {
        balancedText += char;
      } else if (opens(char)) {
        stack.push(char);
        balancedText += char;
      } else if (openingChar) {
        balancedText += char;
      } else if (balancedText) {
        return balancedText;
      }
    }
    if (stack.length) return '';
    return balancedText;
  };
});
