import eventHub from '../../client/services/eventHub';

const itemOfSearch = (function (eventHub) {
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

})(eventHub);

export default itemOfSearch;
