lm.register('item.customKeyboardShortcuts', ['_','keydownToString','transaction','userPreferences'], function (_, keydownToString, transaction, userPreferences) {

  var globalShortcuts;
  var $shortcutsDisplay;

  return function(e) {
    var shortcuts = [];
    var options = [];
    var nextUp = (this.key === 'keyboard shortcuts' ? this : this.$$item('keyboard shortcuts'));
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
        var executeCommand = _.flow(_.property('text'), _.bind(this.executeCommand, this));
        _.each(shortcut.$items, executeCommand);
      }, this);
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

