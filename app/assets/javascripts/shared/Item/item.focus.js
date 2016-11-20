calculist.register('item.focus', ['_','isReadOnly'], function (_, isReadOnly) {


  return _.debounce(function() {
    var $input = this.$("#input" + this.id);
    if (isReadOnly()) {
      $input.addClass('focus');
    } else {
      $input.focus();
    }
  });

});
