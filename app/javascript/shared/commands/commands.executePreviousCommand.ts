import commandTypeahead from '../../client/ui/commandTypeahead';
import executeCommand from '../Item/item.executeCommand';

const commands_executePreviousCommand = (function (commandTypeahead) {

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

})(commandTypeahead);

(function (ec) {
    // NOTE This nested require is a hack to avoid the
    // circular dependency error.
    executeCommand = ec;
  })(executeCommand);

return function (item) {
    if (isExecuting) return;
    isExecuting = true;
    executeCommand(item, commandTypeahead.getLastCommand());
    isExecuting = false;
  };

})

export default commands_executePreviousCommand;
