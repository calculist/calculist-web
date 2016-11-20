calculist.require(['Item','createComputationContextObject'], function (Item, createComputationContextObject) {

  Item.prototype.formatNumber = function(n) {
    var formatItem = this.$$item('number format');
    if (formatItem) {
      try {
        return formatItem.valueOf()(n);
      } catch (error) {
        // log(error);
        return n;
      }
    } else {
      return n;
    }
  };

});
