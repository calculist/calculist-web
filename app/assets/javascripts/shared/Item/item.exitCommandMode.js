calculist.register('item.exitCommandMode', ['eventHub'], function (eventHub) {

    return function() {
      eventHub.trigger('item.exitCommandMode:before', this);
      this.mode = null;
      this.$("#input" + this.id).removeClass('command').text(this.text);
      this.focus();
      eventHub.trigger('item.exitCommandMode', this);
    };

});
