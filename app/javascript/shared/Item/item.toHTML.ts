import _ from 'lodash';

const item_toHTML = (function (_) {

    return function (uncomputed, hideCollapsed) {
      return '<li>' +
        '<span>' + (uncomputed ? _.escape(this.text) : this.getComputedHTML()) + '</span>' +
        ((this.items.length && (hideCollapsed ? !this.collapsed : true)) ?
          '<ul>' + _.map(this.items, _.method('toHTML')).join('') + '</ul>'
          : '') +
      '</li>';
    };

})(_);

export default item_toHTML;
