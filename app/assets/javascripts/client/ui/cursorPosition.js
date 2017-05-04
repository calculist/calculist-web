calculist.register('cursorPosition', ['_'], function (_) {

  var DEPTH_UNIT = 5;

  var previousCursorPosition = 0;
  var cursorPosition = 0;

  var calculateCursorPosition = function (text, depth, position) {
    return (depth - 1) * DEPTH_UNIT + position;
  };

  var cursorPositionMinusDepth = function (depth, position) {
    return (position == null ? cursorPosition : position) - (depth - 1) * DEPTH_UNIT;
  };

  return {
    set: function (text, depth, offset) {
      if (!_.isNumber(offset)) {
        offset = document.getSelection().anchorOffset;
      }
      // var selection = document.getSelection(),
      //     anchorOffset = selection.anchorOffset,
      //     baseOffset = selection.baseOffset,
      //     extentOffset = selection.extentOffset,
      //     focusOffset = selection.focusOffset,
      //     rangeCount = selection.rangeCount;
      previousCursorPosition = cursorPosition;
      cursorPosition = calculateCursorPosition(text, depth, offset);
    },
    get: function (depth) {
      return Math.max(0, cursorPositionMinusDepth(depth));
    },
    getPrevious: function (depth) {
      return Math.max(0, cursorPositionMinusDepth(depth, previousCursorPosition));
    },
    getWithCurrentOffset: function (text, depth) {
      return Math.max(0, cursorPositionMinusDepth(depth, calculateCursorPosition(text, depth, document.getSelection().baseOffset)));
    }
  };

});
