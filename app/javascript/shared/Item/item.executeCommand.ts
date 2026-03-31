import _ from 'lodash';
import commands from '../commands/commands';
import transaction from '../../client/services/transaction';
import computeItemValue from './computeItemValue';
import commandTypeahead from '../../client/ui/commandTypeahead';
import itemOfSearch from './itemOfSearch';

// executeCommand — the global command executor
const executeCommand = (function (_: any, commands: any, transaction: any, computeItemValue: any, commandTypeahead: any, itemOfSearch: any) {

  return function (contextItem: any, commandString: string) {
    var commandStringPieces = commandString.split(/([^\w\s]|\d)/);
    if (commandStringPieces[0] === '') commandStringPieces[0] = 'noop';
    commandStringPieces[0] = _.camelCase(commandStringPieces[0]);
    if (commandStringPieces[0] === 'delete') commandStringPieces[0] = '_delete';
    if ((contextItem.mode === 'command' || contextItem.mode === 'search:command') && !_.isFunction(commands[commandStringPieces[0]]) ) {
      commandString = commandTypeahead.getTopMatch() || 'noop';
      commandStringPieces = commandString.split(/([^\w\s]|\d)/);
      commandStringPieces[0] = _.camelCase(commandStringPieces[0]);
    }
    var commandArgumentsString;
    if (commandStringPieces[0] === 'forEach' || commandStringPieces[0] === 'forItem') {
      var enclosureDepth = 0;
      var commandArgumentsStringPieces = commandStringPieces.slice(1).join('').split('');
      var firstArgumentString = '';
      var char = commandArgumentsStringPieces.shift();
      while (commandArgumentsStringPieces.length) {
        firstArgumentString += char;
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
    var additionalVariables = commandArgumentsString ? {
      '$value': contextItem.valueOf(),
      '$results': itemOfSearch.getSearchResultsItems(),
    } : null;
    var computingForCommand = true;
    var commandArguments: any = commandArgumentsString ? computeItemValue('[' + commandArgumentsString + ']', contextItem, additionalVariables, computingForCommand) : [];
    commandArguments.unshift(contextItem);
    var mode = contextItem.mode;
    transaction(function () {
      commandFunction.apply(commands, commandArguments);
    });
    if ((mode === 'command' || mode === 'search:command') && commandStringPieces[0] !== 'executePreviousCommand') commandTypeahead.end(commandString);
  };

})(_, commands, transaction, computeItemValue, commandTypeahead, itemOfSearch);

// item.executeCommand — the Item prototype method that delegates to executeCommand
const item_executeCommand = (function (_: any, executeCommand: any) {
  return _.rest(function (args: any[]) {
    args.unshift(this);
    return executeCommand.apply(null, args);
  });
})(_, executeCommand);

export default executeCommand;
export { item_executeCommand };
