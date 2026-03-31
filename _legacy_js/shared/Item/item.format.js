calculist.require(['Item','replaceTeX','_','userIsTyping','slashElementsHelper'], function (Item, replaceTeX, _, userIsTyping, slashElementsHelper) {

  var ERROR_VAL = '#ERROR!';

  Item.prototype.formatVal = function(val) {
    if (_.isNaN(val)) {
      val = userIsTyping() ? '' : ERROR_VAL;
    } else if (_.isFunction(val)) {
      val = val.toHTML ? val.toHTML() : _.escape(val.toString()) || '[Function]';
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
    return slashElementsHelper.parseSlashElements(
      replaceTeX(_.escape(key))
              .replace('\\\\=', '\\=')
              .replace('\\[=&gt;]', '[=&gt;]')
              .replace('\\\\:', '\\:')
    );
  };

});
