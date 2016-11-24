calculist.register('item.applySyntaxHighlighting',[], function () {

  var specialItems = {
    'templates': true,
    'keyboard shortcuts': true,
    'number format': true,
    'onpageload': true,
  };

  // TODO Do actual syntax highlighting
  return function() {
    if (specialItems[this.key]) {
      this.isSpecial = true;
      this.$("#input" + this.id).addClass('special-item');
    } else if (this.isSpecial) {
      this.isSpecial = false;
      this.$("#input" + this.id).removeClass('special-item');
    }
  };

});
