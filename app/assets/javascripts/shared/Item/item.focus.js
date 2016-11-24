calculist.register('item.focus', ['_'], function (_) {

  return _.debounce(function() { this.$("#input" + this.id).focus(); });

});
