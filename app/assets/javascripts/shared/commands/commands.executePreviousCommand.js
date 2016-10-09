calculist.register('commands.executePreviousCommand', ['commandTypeahead'], function (commandTypeahead) {

  var isExecuting = false;

  return function (item) {
    if (isExecuting) return;
    isExecuting = true;
    item.executeCommand(commandTypeahead.getLastCommand());
    isExecuting = false;
  };

})
