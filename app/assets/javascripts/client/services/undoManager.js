calculist.register('undoManager', ['UndoManager','_','eventHub','getItemByGuid','lmDiff'], function (UndoManager, _, eventHub, getItemByGuid, lmDiff) {

  var undoManager = new UndoManager(),
      previousData, focusGuid, undoIndex;

  var reverseDelta = function (delta) {
    var rDelta = {};
    _.each(delta, function (val, key) {
      if (_.isPlainObject(val)) {
        rDelta[key] = _.mapValues(val, function (d) {
          return d.slice().reverse();
        });
      } else if (val.length === 3) {
        rDelta[key] = [val[0]];
      } else if (val.length === 1) {
        rDelta[key] = [val[0], 0, 0];
      }
    });
    return rDelta;
  };

  undoManager.setLimit(100);

  eventHub.on('transactionstart', function () {
    previousData = window.topItem.flatten();
    focusGuid = sessionStorage.focusGuid;
    undoIndex = undoManager.getIndex();
  });

  eventHub.on('transactionend', function () {
    // TODO figure out how previousData can be null sometimes
    if (previousData == null) return;
    // If the index has changed, that means an undo or redo happened
    // in the transaction, and we should ignore the event
    if (undoIndex !== undoManager.getIndex()) return;
    var newData = window.topItem.flatten();
    lmDiff.plainDiff(previousData, newData).then(function (delta) {

      var previousFocusGuid = focusGuid,
          redoFocusGuid;

      if (delta) {
        var applyDelta = function (delta, direction) {
          _.each(delta, function (val, key) {
            var item = getItemByGuid(key);
            if (item && _.isPlainObject(val)) item.applyDelta(val);
            // if val is an array, then noop
          });
          window.topItem.save();
          window.topItem.softRenderAll();
        };
        undoManager.add({
          redo: function () {
            applyDelta(delta);
            eventHub.trigger('redo', delta);
            var focusItem = getItemByGuid(redoFocusGuid);
            if (focusItem) {
              _.defer(function() {
                focusItem.focus();
              });
            }
          },
          undo: function () {
            redoFocusGuid = sessionStorage.focusGuid;
            var rDelta = reverseDelta(delta);
            applyDelta(rDelta);
            eventHub.trigger('undo', rDelta);
            var focusItem = getItemByGuid(previousFocusGuid);
            if (focusItem) {
              _.defer(function() {
                focusItem.focus();
              });
            }
          }
        });
        eventHub.trigger('undoableTransaction', delta);
      }
      window.topItem.save();
      window.topItem.softRenderAll();
    });
    previousData = null;
  });

  // TODO make this a command, like other keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    var Z = 90, Y = 89;
    if (e.which === Z && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      undoManager.undo();
    } else if (e.which === Y && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      undoManager.redo();
    }
  });

  return undoManager;

});
