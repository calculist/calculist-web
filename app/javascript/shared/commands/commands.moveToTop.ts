import _ from 'lodash';

const commands_moveToTop = (function (_) {

  return function (item) {
    _.pull(item.parent.items, item);
    item.parent.items.unshift(item);
    item.refreshSortOrder();
    item.parent.renderChildren();
  }

})(_);

export default commands_moveToTop;
