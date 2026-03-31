import _ from 'lodash';
import zoomPage from '../../client/ui/zoomPage';

const item_moveDown = (function (_, zoomPage) {

  return function() {
    var child = this;
    var originalParent = this.parent;
    var nextParent, nextSibling;
    nextSibling = originalParent.getNextSibling(child);
    if (nextSibling && zoomPage.isInPage(nextSibling)) {
      originalParent.removeChild(child);
      originalParent.insertAfter(child, nextSibling);
      originalParent.renderChildren();
    } else if (!nextSibling) {
      nextParent = originalParent.parent.getNextItemAtDepth(originalParent, originalParent.depth, true);
      if (!(nextParent && zoomPage.isInPage(nextParent))) {
        return;
      }
      originalParent.removeChild(child);
      child.parent = nextParent;
      nextParent.items.unshift(child);
      if (nextParent.collapsed) {
        nextParent.toggleCollapse();
      }
      nextParent.render();
    }
    child.refreshSortOrder();
    child.focus();
    this.save();
  };


})(_, zoomPage);

export default item_moveDown;
