calculist.require(['Item','replaceTeX','_','userIsTyping', 'emojiHelper'], function (Item, replaceTeX, _, userIsTyping, emojiHelper) {

  var ERROR_VAL = '#ERROR!';

  Item.prototype.formatVal = function(val) {
    if (_.isNaN(val)) {
      val = userIsTyping() ? '' : ERROR_VAL;
    } else if (_.isFunction(val)) {
      val = _.escape(val.toString()) || '[Function]';
    } else if (_.isArray(val)) {
      val = '[Array] ' + val.length;
    } else if (val !== '' && !_.isNaN(+val)) {
      val = this.formatNumber(+val);
    } else if (val && _.isString(val)) {
      val = replaceTeX(_.escape(val));
    }
    return val;
  };

  Item.prototype.formatKey = function(key) {
    return replaceTeX(_.escape(key))
              .replace('\\[=]', '[=]')
              .replace('\\[=&gt;]', '[=&gt;]')
              .replace('\\[:]', '[:]')
              .replace(/\\emoji\[([\\a-zA-Z0-9]+)\]/g, function (text, emojiUTF16) {
                return emojiHelper.unescapeToUnicode(emojiUTF16);
              })
              .replace(/\\emoji\[(U\+[\\a-fA-F0-9]+)\]/g, function (text, codePointString) {
                return emojiHelper.fromCodePointString(codePointString);
              })
              ;
  };

});
