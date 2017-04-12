calculist.require(['Item','_','isReadOnly'], function (Item, _, isReadOnly) {

  'use strict';

  Item.prototype.events = function() {
    var events = {},
        id = this.id || (this.id = _.uniqueId());
    events["keydown #input" + id] = 'handleKeydown';
    events["keypress #input" + id] = 'handleKeypress';
    events["keyup #input" + id] = 'handleKeyup';
    events["focus #input" + id] = 'handleFocus';
    events["blur #input" + id] = 'handleBlur';
    events["paste #input" + id] = 'handlePaste';
    events["mousemove .input-container:first"] = 'handleMousemove';
    events["mouseout .input-container:first"] = 'handleMouseout';
    if (isReadOnly()) events["click #input" + id] = 'focus';
    events["click #dot" + id] = 'handleDotClick';
    events["mousedown #dot" + id] = 'handleDotMousedown';
    events["dblclick #input" + id] = 'enterCommandMode';
    return events;
  };

});
