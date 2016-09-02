lm.register('item.toHTML', ['_'], function (_) {

    return function() {
      // TODO Add option for uncomputed or ignore collapsed
      return '<li>' +
        '<span>' + this.getComputedHTML() + '</span>' +
        (this.$items.length ?
          '<ul>' + _.map(this.$items, _.method('toHTML')).join('') + '</ul>'
          : '') +
      '</li>';
    };

});
