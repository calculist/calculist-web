calculist.register('commands.executePreviousCommand', ['commandTypeahead'], function (commandTypeahead) {

  var isExecuting = false;
  var executeCommand;
  calculist.require(['executeCommand'], function (ec) {
    // NOTE This nested require is a hack to avoid the
    // circular dependency error.
    executeCommand = ec;
  })

  return function (item) {
    if (isExecuting) return;
    isExecuting = true;
    executeCommand(item, commandTypeahead.getLastCommand());
    isExecuting = false;
  };

})
