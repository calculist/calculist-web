calculist.register('item.handleBlur', ['_','eventHub'], function (_, eventHub) {

  var itemsToBlur = [];

  var addToQueue = function (item) {
    if (!_.includes(itemsToBlur, item)) itemsToBlur.push(item);
  };

  var blurItem = function (item) {
    if (!item) return;
    _.pull(itemsToBlur, item);
    item.showComputedValue();
    item.showLinkButtons();
    var $input = item.$("#input" + item.id);
    $input.removeClass('focus');
    $input.css({minHeight: '16px'});
    eventHub.trigger('item.handleBlur', item);
  };

  var blurItems = function (focusItem) {
    if (itemsToBlur.length === 0) return;
    _.pull(itemsToBlur, focusItem);
    while (itemsToBlur.length) blurItem(itemsToBlur.shift());
  };

  eventHub.on('itemOfFocusChange:before', addToQueue);
  eventHub.on('itemOfFocusChange', blurItems);

  return function() {
    eventHub.trigger('item.handleBlur:before', this);
    if (this.mode === 'command') this.exitCommandMode();
    addToQueue(this);
  };

});
