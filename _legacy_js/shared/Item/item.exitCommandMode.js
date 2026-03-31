calculist.register('item.exitCommandMode', ['eventHub'], function (eventHub) {

    return function() {
      eventHub.trigger('item.exitCommandMode:before', this);
      var text;
      if (this.mode === 'search:command') {
        this.mode = 'search';
        text = this.searchResults.query.toString();
      } else {
        this.mode = null;
        text = this.text;
      }
      this.$("#input" + this.id).removeClass('command').text(text);
      this.focus();
      eventHub.trigger('item.exitCommandMode', this);
    };

});
