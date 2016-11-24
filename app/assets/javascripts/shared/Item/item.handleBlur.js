calculist.register('item.handleBlur', ['_','eventHub'], function (_, eventHub) {

  var itemsToBlur = [];

  var blurItem = function (item) {
    item.showComputedValue();
    var $input = item.$("#input" + item.id);
    $input.removeClass('focus');
  }

  var blurItems = function (focusItem) {
    _.pull(itemsToBlur, focusItem);
    while (itemsToBlur.length) blurItem(itemsToBlur.shift());
  }

  eventHub.on('itemOfFocusChange', blurItems);

  return function() {
    if (this.mode === 'command') this.exitCommandMode();
    if (!_.includes(itemsToBlur, this)) itemsToBlur.push(this);
  };

});
