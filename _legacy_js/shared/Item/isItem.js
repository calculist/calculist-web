calculist.register('isItem', ['Item'], function (Item) {
  return function (obj) {
    return obj && obj.constructor === Item;
  };
});
