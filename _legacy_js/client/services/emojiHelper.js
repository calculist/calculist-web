calculist.register('emojiHelper', [], function () {
  // // From https://thekevinscott.com/emojis-in-javascript/
  var emojiPattern = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c\ude32-\ude3a]|[\ud83c\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
  // function toUTF16(emoji) {
  //   var codePoint = emoji.codePointAt(0);
  //   var TEN_BITS = parseInt('1111111111', 2);
  //   function u(codeUnit) {
  //     return '\\u'+codeUnit.toString(16).toUpperCase();
  //   }
  //
  //   if (codePoint <= 0xFFFF) {
  //     return u(codePoint);
  //   }
  //   codePoint -= 0x10000;
  //
  //   // Shift right to get to most significant 10 bits
  //   var leadSurrogate = 0xD800 + (codePoint >> 10);
  //
  //   // Mask to get least significant 10 bits
  //   var tailSurrogate = 0xDC00 + (codePoint & TEN_BITS);
  //
  //   return u(leadSurrogate) + u(tailSurrogate);
  // }
  var unescapeToUnicode = function (string) {
    try {
      return JSON.parse('"' + string + '"');
    } catch (e) {
      return string;
    }
  };
  var toCodePointString = function (emoji) {
    return 'U+' + emoji.codePointAt(0).toString(16).toUpperCase();
  };
  var fromCodePointString = function (codePointString) {
    var base16Num = codePointString.split('U+')[1];
    if (!base16Num) return codePointString;
    return String.fromCodePoint(parseInt(base16Num, 16));
  };
  return {
    emojiPattern: emojiPattern,
    // toUTF16: toUTF16,
    unescapeToUnicode: unescapeToUnicode,
    toCodePointString: toCodePointString,
    fromCodePointString: fromCodePointString,
  };

});
