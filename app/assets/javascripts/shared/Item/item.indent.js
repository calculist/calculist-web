calculist.register('item.indent', ['zoomPage'], function (zoomPage) {

  return function () {
    var newParent, _ref;
    newParent = this.$parent.getUpperSibling(this);
    if (!(newParent && zoomPage.isInPage(newParent))) {
      return;
    }
    this.$parent.removeChild(this);
    this.$parent = newParent;
    this.$parent.$items.push(this);
    this.refreshDepth();
    this.save();
    if (this.$parent.collapsed) {
      this.$parent.toggleCollapse();
    } else {
      this.$parent.renderChildren();
    }
    this.refreshSortOrder();
    this.focus();
  };

});
