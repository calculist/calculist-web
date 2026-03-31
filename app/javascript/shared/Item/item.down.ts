import _ from 'lodash';
import lmSessionStorage from '../../client/services/lmSessionStorage';

const item_down = (function (_, lmSessionStorage) {

  return function(skipChildren, maintainDepth) {
    var i, item, nextItem, nextSibling, _ref;
    if (this.mode === 'search') {
      var indexChange = 1;
      this.navigateSearchResults(indexChange);
    } else if (maintainDepth) {
      nextItem = this.parent.getNextItemAtDepth(this, this.depth);
      if (nextItem && nextItem.isWithinZoom()) {
        nextItem.focus();
      }
    } else {
      skipChildren = skipChildren === true || this.collapsed;
      i = 0;
      if (!skipChildren) {
        item = this.items[i];
      }
      if (item && !skipChildren) {
        item.focus();
      } else if (this.parent) {
        nextSibling = this.parent.getNextSibling(this);
        if (nextSibling && nextSibling.isWithinZoom()) {
          nextSibling.focus();
        } else {
          this.parent.down(true);
        }
      }
    }
  };

})(_, lmSessionStorage);

export default item_down;
