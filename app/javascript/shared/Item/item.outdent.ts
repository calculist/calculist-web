import _ from 'lodash';
import zoomPage from '../../client/ui/zoomPage';

const item_outdent = (function (_, zoomPage) {

  return function () {
    var newParent, previousParent;
    previousParent = this.parent;
    newParent = previousParent.parent;
    if (!(newParent && zoomPage.isInPage(newParent))) {
      return;
    }
    this.parent = newParent;
    this.parent.insertAfter(this, previousParent);
    previousParent.removeChild(this);
    this.refreshDepth();
    this.parent.renderChildren();
    if (this.parent.collapsed) {
      this.parent.toggleCollapse();
    }
    this.refreshSortOrder();
    this.save();
    this.focus();
  };

})(_, zoomPage);

export default item_outdent;
