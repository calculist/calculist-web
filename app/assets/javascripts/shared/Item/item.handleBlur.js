calculist.register('item.handleBlur', [], function () {

  return function() {
    if (this.mode === 'command') {
      this.exitCommandMode();
    }
    this.hasFocus = false;
    this.showComputedValue();
  };

});
