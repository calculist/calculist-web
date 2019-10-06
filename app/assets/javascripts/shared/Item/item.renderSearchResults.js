calculist.register('item.renderSearchResults', ['_'], function (_) {

  var showOrHide = function (items, pattern, results) {
    return items.reduce(function (hadMatch, item) {
      var resultsIndex = results.items.length;
      var isMatch = pattern.test(item.text);
      var hasMatch = showOrHide(item.items, pattern, results);
      if (isMatch || hasMatch) {
        if (isMatch) results.items.splice(resultsIndex, 0, item);
        item.$el.show();
        if (hasMatch && item.collapsed) {
          item.wasCollapsed = true;
          item.collapsed = false;
          item.render();
        }
        var input = item.$('#input' + item.id);
        if (input) {
          input.css('opacity', isMatch ? '1.0' : '0.4');
          input.removeClass('focus');
        }
      } else {
        item.$el.hide();
      }
      return isMatch || hasMatch || hadMatch;
    }, false);
  };

  var resetSearchResults = function (_this, query) {
    _this.searchResults = {
      query: query,
      items: [],
      selectionIndex: -1
    };
  };

  return _.debounce(function (query) {
    if (!query && !this.searchResults) return;
    if (!query) {
      resetSearchResults(this, query);
      this.items.forEach(function (item) { item.$el.hide(); });
      return;
    }
    if (this.searchResults && this.searchResults.query === query) return;
    if (query && !this.searchResults && this.collapsed) {
      this.wasCollapsed = true;
      this.collapsed = false;
      this.renderChildren();
    }
    resetSearchResults(this, query);
    var pattern = new RegExp(_.escapeRegExp(query), 'i');
    showOrHide(this.items, pattern, this.searchResults);
    this.$el.unmark();
    this.$('#list' + this.id).markRegExp(pattern);
  }, 100);

});
