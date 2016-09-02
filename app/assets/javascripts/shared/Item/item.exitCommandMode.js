lm.register('item.exitCommandMode', [], function () {

    return function() {
      this.mode = null;
      this.$("#input" + this.id).removeClass('command').text(this.text);
      this.focus();
    };

});
