lm.require(['Item','createComputationContextObject'], function (Item, createComputationContextObject) {

  Item.prototype.formatNumber = function(n) {
    var formatItem = this.$$item('number format');
    if (formatItem) {
      try {
        return (new Function('n', "with (this) { return " + (formatItem.valueOf()) + "; }")).call(createComputationContextObject(), n);
      } catch (error) {
        // log(error);
        return n;
      }
    } else {
      return n;
    }
  };

});
