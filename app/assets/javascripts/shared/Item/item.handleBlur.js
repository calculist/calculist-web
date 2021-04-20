calculist.register('item.handleBlur', ['_','eventHub', 'executeCommand'], function (_, eventHub, executeCommand) {

  var itemsToBlur = [];

  var addToQueue = function (item) {
    if (!_.includes(itemsToBlur, item)) itemsToBlur.push(item);
  };

  var blurItem = function (item, focusItem) {
    if (!item) return;
    _.pull(itemsToBlur, item);
    item.showComputedValue();
    item.showLinkButtons();
    if (!focusItem || item.parent !== focusItem.parent) item.blurContainingList();
    var $input = item.$("#input" + item.id);
    $input.removeClass('focus');
    $input.css({minHeight: '16px'});
    // $input.css({minHeight: '16px', height: 'auto', overflow:'hidden'});
    eventHub.trigger('item.handleBlur', item);
  };

  var blurItems = function (focusItem) {
    if (itemsToBlur.length === 0) return;
    _.pull(itemsToBlur, focusItem);
    while (itemsToBlur.length) blurItem(itemsToBlur.shift(), focusItem);
  };

  eventHub.on('itemOfFocusChange:before', addToQueue);
  eventHub.on('itemOfFocusChange', blurItems);

  return function() {
    eventHub.trigger('item.handleBlur:before', this);
    if (this.mode === 'command' || this.mode === 'search:command') this.exitCommandMode();
    if (this.mode === 'search') _.defer(executeCommand, this, 'exit search mode');
    addToQueue(this);
  };

});
