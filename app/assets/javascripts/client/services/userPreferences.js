calculist.register('userPreferences',['_','Item'], function (_, Item) {

  if (!window.USER_PREFERENCES) {
    return new Item({
      guid: 'not a real item',
      $items: [],
      invisible: true
    });
  }

  window.USER_PREFERENCES.invisible = true;

  var userPreferences = new Item(window.USER_PREFERENCES);

  var evaluate = function (item) {
    item.valueOf();
    _.each(item.$items, evaluate);
  };

  // FIXME Should not have to do this
  window.requestAnimationFrame(function () {
    evaluate(userPreferences);
  });

  return userPreferences;

});
