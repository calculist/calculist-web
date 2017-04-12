calculist.register('item.handleMousemove', ['itemOfDrag'], function (itemOfDrag) {
  return function(e) {
    var dragItem = itemOfDrag.get();
    if (!dragItem || dragItem === this) return;
    var nextParent = this.parent;
    while (nextParent) {
      if (nextParent === dragItem) return;
      nextParent = nextParent.parent;
    }
    e.preventDefault();
    var target = this;
    var direction = e.offsetY < 8 ? 'above' : 'below';
    var opposite = direction == 'above' ? 'below' : 'above';
    var $inputContainer = this.$('.input-container:first');
    if (!this.collapsed && this.items.length) {
      if (direction === 'below' || !this.parent) {
        $inputContainer.removeClass('drop-target-above');
        target = this.items[0];
        direction = 'above';
        this.items[0].$('.input-container:first').addClass('drop-target-above');
      } else {
        $inputContainer.addClass('drop-target-above');
        this.items[0].$('.input-container:first').removeClass('drop-target-above');
      }
    } else {
      $inputContainer.addClass('drop-target-' + direction).removeClass('drop-target-' + opposite);
    }
    itemOfDrag.changeTarget(target, direction);
  };
});
