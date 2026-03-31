calculist.register('item.handleDotMousedown', ['itemOfDrag'], function (itemOfDrag) {
  return function () { itemOfDrag.change(this); };
});
