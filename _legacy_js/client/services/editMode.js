calculist.register('editMode', ['userAgentHelper', 'eventHub'], function (userAgentHelper, eventHub) {
  var isEditing = !userAgentHelper.isMobileDevice;
  var delayedExitTimeout = null;
  var cancelExit = function () {
    if (delayedExitTimeout) {
      clearTimeout(delayedExitTimeout);
      delayedExitTimeout = null;
    }
  };
  var lastSet = (new Date()).getTime();
  var set = function (bool) {
    if (bool === true) cancelExit();
    lastSet = (new Date()).getTime();
    if (bool === true && isEditing === false) {
      isEditing = true;
      $('.input').attr('contenteditable', 'true');
      eventHub.trigger('editModeChange', isEditing);
    } else if (bool === false && isEditing === true) {
      isEditing = false;
      $('.input').attr('contenteditable', 'false');
      eventHub.trigger('editModeChange', isEditing);
    } else if (typeof bool !== 'boolean') {
      throw new TypeError('unexpected value: ' + bool);
    }
  };
  var exitAfterDelay = function () {
    if (!userAgentHelper.isMobileDevice) return;
    if (((new Date()).getTime() - lastSet) < 100) return;
    if (delayedExitTimeout) clearTimeout(delayedExitTimeout);
    delayedExitTimeout = setTimeout(function () {
      set(false);
    }, 100);
  };
  eventHub.on('item.handleBlur:before', exitAfterDelay);
  return {
    set: set,
    cancelExit: cancelExit,
    isEditing: function () {
      return isEditing;
    }
  }
});
