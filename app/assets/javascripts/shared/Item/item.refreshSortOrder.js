calculist.register('item.refreshSortOrder', ['_'], function (_) {

  return function () {
    var siblings = this.$parent.$items,
        thisIndex = siblings.indexOf(this);

    if (thisIndex === -1) throw('incorrect parent item');

    var upperSibling = thisIndex > 0 ? siblings[thisIndex - 1] : null,
        nextSibling = siblings[thisIndex + 1],
        above = upperSibling ? upperSibling.sort_order : 0,
        below = nextSibling ? nextSibling.sort_order : (above + 200),
        difference = below - above;

    if (difference <= 0.00001 || _.isNaN(difference)) {
      _.each(siblings, function (sibling, i) {
        sibling.sort_order = (i + 1) * 100;
      });
      // console.log('reset sort order for ' + siblings.length + ' items.');
    } else if (this.sort_order <= above || this.sort_order >= below || this.sort_order == null) {
      this.sort_order = above + (difference / 2);
      // console.log(this.sort_order, _.map(siblings, 'sort_order'));
    }
  };

});
