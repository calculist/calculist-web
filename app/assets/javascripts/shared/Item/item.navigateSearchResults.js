calculist.register('item.navigateSearchResults', [], function () {

  return function(indexChange) {
    if (!this.searchResults) return;
    var i = this.searchResults.selectionIndex;
    var item = this.searchResults.items[i];
    var nextIndex = (i + indexChange) % this.searchResults.items.length;
    var nextItem = this.searchResults.items[nextIndex];
    if (item) item.$('#input' + item.id).removeClass('focus');
    this.searchResults.selectionIndex = Math.max(nextIndex, -1);
    if (nextItem) {
      nextItem.$('#input' + nextItem.id).addClass('focus');
    }
  };

});
