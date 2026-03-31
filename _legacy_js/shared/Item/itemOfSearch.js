calculist.register('itemOfSearch', ['eventHub'], function (eventHub) {
  var itemOfSearch = null;

  return {
    change: function (item) {
      if (item === itemOfSearch) return;
      eventHub.trigger('itemOfSearchChange:before', itemOfSearch);
      itemOfSearch = item;
      eventHub.trigger('itemOfSearchChange', itemOfSearch);
    },
    get: function () { return itemOfSearch; },
    getSearchResultsItems: function () {
      return itemOfSearch && itemOfSearch.searchResults && itemOfSearch.searchResults.items;
    },
  };

});
