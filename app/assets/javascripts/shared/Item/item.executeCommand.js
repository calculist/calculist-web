calculist.register('item.executeCommand', ['_', 'commands', 'transaction', 'computeItemValue', 'commandTypeahead'], function (_, commands, transaction, computeItemValue, commandTypeahead) {

  return function (commandString) {
    var commandStringPieces = commandString.split(/([^\w\s]|\d)/);
    commandStringPieces[0] = _.camelCase(commandStringPieces[0]);
    if (commandStringPieces[0] === 'delete') commandStringPieces[0] = '_delete';
    if (this.mode === 'command' && !_.isFunction(commands[commandStringPieces[0]]) ) {
      commandString = commandTypeahead.getTopMatch() || 'noop';
      commandStringPieces = commandString.split(/([^\w\s]|\d)/);
      commandStringPieces[0] = _.camelCase(commandStringPieces[0]);
    }
    var commandArgumentsString;
    if (commandStringPieces[0] === 'forEachItem' && commandStringPieces[1] === ',') {
      commandArgumentsString = '"' + commandStringPieces.slice(2).join('').replace(/"/g, '\\"') + '"';
    } else if (commandStringPieces[0] === 'forEachItemRecursively' && commandStringPieces[1] === ',') {
      commandArgumentsString = '"' + commandStringPieces.slice(2).join('').replace(/"/g, '\\"') + '"';
    } else {
      commandArgumentsString = commandStringPieces.slice(1).join('');
    }
    var commandFunction = commands[commandStringPieces[0]];
    var additionalVariables = commandArgumentsString ? { '$value': this.valueOf() } : null;
    var computingForCommand = true;
    var commandArguments = commandArgumentsString ? computeItemValue('[' + commandArgumentsString + ']', this, additionalVariables, computingForCommand) : [];
    commandArguments.unshift(this);
    var mode = this.mode;
    transaction(function () {
      commandFunction.apply(commands, commandArguments);
    });
    if (mode === 'command' && commandStringPieces[0] !== 'executePreviousCommand') commandTypeahead.end(commandString);
  };

});
