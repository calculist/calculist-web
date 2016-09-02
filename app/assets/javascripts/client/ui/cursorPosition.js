lm.register('cursorPosition', ['_'], function (_) {

  var DEPTH_UNIT = 5;

  var cursorPosition = 0;

  var calculateCursorPosition = function (text, depth, position) {
    return text.length === position ? Infinity : (depth - 1) * DEPTH_UNIT + position;
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
      cursorPosition = calculateCursorPosition(text, depth, offset);
    },
    get: function (depth) {
      return Math.max(0, cursorPositionMinusDepth(depth));
    },
    getWithCurrentOffset: function (text, depth) {
      return Math.max(0, cursorPositionMinusDepth(depth, calculateCursorPosition(text, depth, document.getSelection().baseOffset)));
    }
  };

});
