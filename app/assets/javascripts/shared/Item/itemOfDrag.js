calculist.register('itemOfDrag', ['transaction','$'], function (transaction, $) {
  var itemOfDrag, dropTarget, dropDirection, $mainContainer, $standin;

  var removeClassesAndStandin = function () {
    $mainContainer || ($mainContainer = $('#main-container'));
    $mainContainer.removeClass('dragging');
    if ($standin) $standin.remove();
    $standin = null;
    itemOfDrag.$el.removeClass('dragging').removeAttr('style');
  };

  var resetVariables = function () {
    itemOfDrag = null;
    dropTarget = null;
    dropDirection = null;
  };

  document.addEventListener('mousemove', function (e) {
    if (!itemOfDrag) return;
    $mainContainer || ($mainContainer = $('#main-container'));
    $mainContainer.addClass('dragging');
    if (!$standin) {
      $standin = $('<li class="dragging-standin"></li>').height(itemOfDrag.$el.height());
      $standin.insertAfter(itemOfDrag.$el);
      itemOfDrag.$el.addClass('dragging');
    }
    itemOfDrag.$el.offset({
      top: (e.clientY + document.body.scrollTop) - 10,
      left: e.clientX + 3,
    });
  });

  document.addEventListener('keydown', function (e) {
    if (itemOfDrag && e.which === 27) { // 27 = esc
      removeClassesAndStandin();
      itemOfDrag.parent.render();
      resetVariables();
    }
  });

  document.addEventListener('mouseup', function () {
    if (itemOfDrag) {
      removeClassesAndStandin();
    }
    if (itemOfDrag && dropTarget && itemOfDrag !== dropTarget) {
      var previousParent = itemOfDrag.parent;
      var newParent = dropTarget.parent;
      var nextNewParent = newParent;
      while (nextNewParent) {
        if (nextNewParent === itemOfDrag) {
          resetVariables();
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
    resetVariables();
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
