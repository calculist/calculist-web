import commandTypeahead from '../../client/ui/commandTypeahead';

declare var require: any;

// Lazy reference to executeCommand to avoid circular dependency
let executeCommand: any;

const commands_executePreviousCommand = (function (commandTypeahead: any) {

  var isExecuting = false;

  return function (item: any) {
    if (isExecuting) return;
    if (!executeCommand) {
      // Resolve lazily on first use
      executeCommand = require('./commands').default;
    }
    isExecuting = true;
    executeCommand(item, commandTypeahead.getLastCommand());
    isExecuting = false;
  };

})(commandTypeahead);

export default commands_executePreviousCommand;
