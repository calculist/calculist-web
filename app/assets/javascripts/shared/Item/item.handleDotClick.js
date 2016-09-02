lm.register('item.handleDotClick', ['_','transaction'], function (_, transaction) {

  return function (e) {
    transaction(this.toggleCollapse, this);
  };

});
