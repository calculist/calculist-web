calculist.register('itemOfDrag', ['transaction','$'], function (transaction, $) {
  var itemOfDrag, dropTarget, dropDirection, $mainContainer;

  document.addEventListener('mousemove', function (e) {
    if (!itemOfDrag) return;
    $mainContainer || ($mainContainer = $('#main-container'));
    $mainContainer.addClass('dragging');
    itemOfDrag.$el.addClass('dragging').css({
      top: e.clientY - 10,
      left: e.clientX + 3,
    });
  });

  document.addEventListener('mouseup', function () {
    if (itemOfDrag) {
      $mainContainer || ($mainContainer = $('#main-container'));
      $mainContainer.removeClass('dragging');
      itemOfDrag.$el.removeClass('dragging').removeAttr('style');
    }
    if (itemOfDrag && dropTarget && itemOfDrag !== dropTarget) {
      var previousParent = itemOfDrag.parent;
      var newParent = dropTarget.parent;
      var nextNewParent = newParent;
      while (nextNewParent) {
        if (nextNewParent === itemOfDrag) {
          itemOfDrag = null;
          dropTarget = null;
          dropDirection = null;
          return;
        }
        nextNewParent = nextNewParent.parent;
      }
      transaction(function () {
        previousParent.removeChild(itemOfDrag);
        newParent[dropDirection === 'above' ? 'insertBefore' : 'insertAfter'](itemOfDrag, dropTarget);
      });
      previousParent.render();
      if (newParent !== previousParent) newParent.render();
      itemOfDrag.focus();
    }
    itemOfDrag = null;
    dropTarget = null;
    dropDirection = null;
  });

  return {
    change: function (item) {
      itemOfDrag = item;
    },
    changeTarget: function (target, direction) {
      dropTarget = target;
      dropDirection = direction;
    },
    get: function () { return itemOfDrag; },
  }
})
