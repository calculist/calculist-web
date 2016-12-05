calculist.register('customKeyboardShortcuts', ['_','keydownToString','transaction','userPreferences','executeCommand'], function (_, keydownToString, transaction, userPreferences, executeCommand) {

  var globalShortcuts;
  var $shortcutsDisplay;

  return function(contextItem, e) {
    var shortcuts = [];
    var options = [];
    var nextUp = (contextItem.key === 'keyboard shortcuts' ? contextItem : contextItem.$$item('keyboard shortcuts'));
    while (nextUp) {
      shortcuts.push(nextUp);
      nextUp = nextUp.$$item('keyboard shortcuts');
    }
    globalShortcuts || (globalShortcuts = userPreferences.$item('keyboard shortcuts'));
    if (globalShortcuts) shortcuts.push(globalShortcuts);
    var string = keydownToString(e);
    var shortcut;
    while (shortcuts.length && !shortcut) {
      shortcut = _.find(shortcuts.shift().$items, function (item) {
        if (_.includes(item.text, string)) options.push({
          shortcutString: item.text,
          commandString: _.map(item.$items, 'text').join('; ')
        });
        return item.text === string && item.$items[0];
      });
    }
    if (shortcut) {
      transaction(function () {
        _.each(shortcut.$items, function (shortcutItem) {
          executeCommand(contextItem, shortcutItem.text);
        });
      });
      return true;
    }
    // if (options.length) {
    //   // TODO abstract this into its own service
    //   if (!$shortcutsDisplay) {
    //     $shortcutsDisplay = $('<div></div>').attr('id', 'shortcuts-display').css({
    //       position: 'absolute',
    //       top: 50,
    //       left: 20
    //     });
    //     $('#main-container').append($shortcutsDisplay);
    //   }
    //   $shortcutsDisplay.html(options.map(function (option) {
    //     return _.escape(option.shortcutString + ' => ' + option.commandString);
    //   }).sort().join('<br/>'));
    // }
    return false;
  };

});
