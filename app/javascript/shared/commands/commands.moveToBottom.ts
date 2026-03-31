import _ from 'lodash';

const commands_moveToBottom = (function (_) {

  return function (item) {
    _.pull(item.parent.items, item);
    item.parent.items.push(item);
    item.refreshSortOrder();
    item.parent.renderChildren();
  }

})(_);

export default commands_moveToBottom;
