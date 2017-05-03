calculist.register('item.up', ['_','zoomPage'], function (_, zoomPage) {

  return function(skipChildren, maintainDepth) {
    if (zoomPage.isTopOfAPage(this)) return;
    var nextUp;
    if (maintainDepth) {
      nextUp = this.parent.getUpperItemAtDepth(this, this.depth);
      if (!nextUp) {
        return;
      }
    } else {
      nextUp = this.parent.getUpperSibling(this);
    }
    if (skipChildren !== true) {
      while (nextUp && !nextUp.collapsed && nextUp.items.length) {
        nextUp = _.last(nextUp.items);
      }
    }
    if (nextUp && nextUp.isWithinZoom()) {
      nextUp.focus();
    } else if (this.parent && !maintainDepth) {
      this.parent.focus();
    }
  };

});
