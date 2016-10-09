calculist.register('item.enterCommandMode', ['_'], function (_) {

  return function(startingText, cursorIndex, highlightWidth) {
    this.mode = 'command';
    this.$("#input" + this.id).addClass('command').text(_.isString(startingText) ? startingText : '');
    // this.$('#typeahead' + this.id).show().append('<li>hello</li>');
    // this.$("#command-input" + this.id).show().val(startingText || '')
    //   .typeahead({}, {
    //     source: function (query, results) {
    //       results(_.filter(['hello','world','foo'], function (s) { return _.includes(s, query); }));
    //     }
    //   });
  };

});
