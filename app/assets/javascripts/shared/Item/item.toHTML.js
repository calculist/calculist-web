calculist.register('item.toHTML', ['_'], function (_) {

    return function (uncomputed, hideCollapsed) {
      return '<li>' +
        '<span>' + (uncomputed ? _.escape(this.text) : this.getComputedHTML()) + '</span>' +
        ((this.$items.length && (hideCollapsed ? !this.collapsed : true)) ?
          '<ul>' + _.map(this.$items, _.method('toHTML')).join('') + '</ul>'
          : '') +
      '</li>';
    };

});
