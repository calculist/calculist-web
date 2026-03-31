import _ from 'lodash';
import zoomPage from '../../client/ui/zoomPage';

const item_moveUp = (function (_, zoomPage) {

  return function() {
    var child = this;
    var originalParent = this.parent;
    var nextUp, nextUpParent;
    nextUp = originalParent.getUpperSibling(child);
    if (nextUp && zoomPage.isInPage(nextUp)) {
      originalParent.removeChild(child);
      originalParent.insertBefore(child, nextUp);
      if (originalParent.collapsed) {
        originalParent.toggleCollapse;
      }
      originalParent.renderChildren();
    } else if (!nextUp) {
      nextUpParent = originalParent.parent.getUpperItemAtDepth(originalParent, originalParent.depth, true);
      if (!(nextUpParent && zoomPage.isInPage(nextUpParent))) {
        return;
      }
      originalParent.removeChild(child);
      child.parent = nextUpParent;
      nextUpParent.items.push(child);
      if (nextUpParent.collapsed) {
        nextUpParent.toggleCollapse();
      } else {
        nextUpParent.render();
      }
    }
    child.refreshSortOrder();
    child.focus();
    this.save();
  };

})(_, zoomPage);

export default item_moveUp;
