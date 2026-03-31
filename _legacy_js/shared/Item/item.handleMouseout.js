calculist.register('item.handleMouseout', ['itemOfDrag'], function (itemOfDrag) {
  return function() {
    if (!itemOfDrag.get()) return;
    this.$('.input-container:first').removeClass('drop-target-above drop-target-below');
    if (!this.collapsed && this.items.length){
      this.items[0].$('.input-container:first').removeClass('drop-target-above drop-target-below');
    }
  };
});
