calculist.require(['Item','_','isReadOnly', 'itemTagsHelper'], function (Item, _, isReadOnly, itemTagsHelper) {

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
    events["mouseover #input" + id + ' span.tag'] = _.debounce(function (e) {
      console.log(e.currentTarget.textContent);
      var idTag = e.currentTarget.textContent.split('ref:')[1];
      if (idTag) {
        e.currentTarget.title = itemTagsHelper.getItemByIdTag(idTag).text;
        return;
      } else {
        idTag = e.currentTarget.textContent.split('id:')[1];
        if (idTag) {
          var refs = itemTagsHelper.getReferencesForIdTag(idTag);
          var refCount = refs.length;
          if (refCount > 5) refs = refs.slice(0, 5);
          e.currentTarget.title = 'referenced by ' + refCount + ' item' + (refCount === 1 ? '' : 's') +
                                  (refCount === 0 ? '' : (':\n' +
                                    refs.map(function (r, i) { return (i + 1) + '. ' + r.text; }).join('\n') +
                                    (refCount > 5 ? ('\n... +' + (refCount - 5) + ' more') : '')
                                  ));
          return;
        } else {
          var label = e.currentTarget.textContent;//.split('label:')[1];
          if (label) {
            var indexAndCount = itemTagsHelper.getLabelIndexAndCount(label, this);
            e.currentTarget.title = '' + (1 + indexAndCount[0]) + ' of ' + indexAndCount[1];
          }
          return;
        }
      }
    }, 300);
    events["mousemove .input-container:first"] = 'handleMousemove';
    events["mouseout .input-container:first"] = 'handleMouseout';
    if (isReadOnly()) events["click #input" + id] = 'focus';
    events["click #dot" + id] = 'handleDotClick';
    events["mousedown #dot" + id] = 'handleDotMousedown';
    // events["dblclick #input" + id] = 'enterCommandMode';
    events["click .link-buttons:first .tag"] = function (e) {
      this.executeCommand(e.currentTarget.title);
    };
    events["click .link-buttons:first .command"] = function (e) {
      this.executeCommand(e.currentTarget.textContent);
    };
    return events;
  };

});
