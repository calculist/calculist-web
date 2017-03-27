calculist.register('item.executeCommand', ['_','executeCommand'], function (_, executeCommand) {
  return _.rest(function (args) {
    args.unshift(this);
    return executeCommand.apply(null, args);
  });
});

calculist.register('executeCommand', ['_', 'commands', 'transaction', 'computeItemValue', 'commandTypeahead'], function (_, commands, transaction, computeItemValue, commandTypeahead) {

  return function (contextItem, commandString) {
    var commandStringPieces = commandString.split(/([^\w\s]|\d)/);
    if (commandStringPieces[0] === '') commandStringPieces[0] = 'noop';
    commandStringPieces[0] = _.camelCase(commandStringPieces[0]);
    if (commandStringPieces[0] === 'delete') commandStringPieces[0] = '_delete';
    if (contextItem.mode === 'command' && !_.isFunction(commands[commandStringPieces[0]]) ) {
      commandString = commandTypeahead.getTopMatch() || 'noop';
      commandStringPieces = commandString.split(/([^\w\s]|\d)/);
      commandStringPieces[0] = _.camelCase(commandStringPieces[0]);
    }
    var commandArgumentsString;
    if (commandStringPieces[0] === 'forEach') {
      var enclosureDepth = 0;
      var commandArgumentsStringPieces = commandStringPieces.slice(1).join('').split('');
      var firstArgumentString = '';
      var char = commandArgumentsStringPieces.shift();
      while (commandArgumentsStringPieces.length) {
        firstArgumentString += char;
        // FIXME Account for strings also.
        if (_.includes(['(','[','{'], char)) {
          ++enclosureDepth;
        } else if (_.includes([')',']','}'], char)) {
          --enclosureDepth;
        } else if (char === ',' && enclosureDepth === 0) {
          break;
        }
        char = commandArgumentsStringPieces.shift();
      };
      commandArgumentsString = firstArgumentString + JSON.stringify(commandArgumentsStringPieces.join(''));
    } else if (commandStringPieces[0] === 'forEachItem' && commandStringPieces[1] === ',') {
      commandArgumentsString = JSON.stringify(commandStringPieces.slice(2).join(''));
    } else if (commandStringPieces[0] === 'forEachItemRecursively' && commandStringPieces[1] === ',') {
      commandArgumentsString = JSON.stringify(commandStringPieces.slice(2).join(''));
    } else {
      commandArgumentsString = commandStringPieces.slice(1).join('');
    }
    var commandFunction = commands[commandStringPieces[0]];
    var additionalVariables = commandArgumentsString ? { '$value': contextItem.valueOf() } : null;
    var computingForCommand = true;
    var commandArguments = commandArgumentsString ? computeItemValue('[' + commandArgumentsString + ']', contextItem, additionalVariables, computingForCommand) : [];
    commandArguments.unshift(contextItem);
    var mode = contextItem.mode;
    transaction(function () {
      commandFunction.apply(commands, commandArguments);
    });
    if (mode === 'command' && commandStringPieces[0] !== 'executePreviousCommand') commandTypeahead.end(commandString);
  };

});
